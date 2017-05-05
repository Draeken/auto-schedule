import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { Task, TaskStatus } from '../task.interface';
import { AgentQuery,
         TimeBoundary,
         AtomicTask,
         TaskTransform,
         LinkTask,
         ProvideQuery,
         Group,
         RelativePos,
         areSameTask } from '../agent-query.interface';
import { ResourceMapperService } from '../resource-mapper.service';
import { Placement } from './placement.class';
import { OptimalPlacement, Bound } from './optimal-placement.function';

export enum MarkerKind {
  Start,
  End,
  Both
}

export interface Marker {
  readonly time: TimeBoundary;
  readonly id: string;
  readonly kind: MarkerKind;
  satisfaction?: number;
  used?: boolean;
}

interface NextMarker {
  readonly markersArrI: number;
  readonly markersI: number;
}

interface TargetPoint {
  readonly time: number;
  readonly satisfaction: number;
}

export interface PossiblePos {
  readonly start: Marker[];
  readonly end: Marker[];
};

export class Timeline {
  private timeline: BehaviorSubject<Placement[]> = new BehaviorSubject([]);
  private userState: Observable<Object>;
  private timelineMarkers: Observable<Marker[]>;
  private minTime = Date.now();
  private maxTime = Date.now() + 3600000 * 24 * 14;
  private optimalPlacement: OptimalPlacement;
  private areProvidersHandled: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private resourceMapper: ResourceMapperService, private allQueries: AgentQuery[]) {
    this.optimalPlacement = new OptimalPlacement(this.minTime, this.maxTime);
    this.timelineMarkers = Observable.of([
      { time: { min: this.minTime, max: this.maxTime }, id: 'timeline', kind: MarkerKind.Both }
    ]);
    Observable
      .combineLatest(allQueries
        .map(this.preprocessingGroup.bind(this))
        .map(this.queriesToPlacements.bind(this)))
      .debounceTime(0) // Wait all timeline.observer
      .map(this.mergeToBestArrangedPlacement)
      .map(placements => placements.sort((x, y) => x.end - y.end))
      .subscribe(this.timeline.next);
    this.timeline.subscribe(this.completeProvidersAndGroups);
  }

  private preprocessingGroup(queries: AgentQuery[]): AgentQuery[] {
    const mapGroup: Map<string, AgentQuery[]> = new Map();
    queries.forEach(q => {
      if (!q.belongsTo || (q.provide && (!q.provide.handled || q.provide.higherPriority.length > 0))) { return; }
      const key = `${q.taskIdentity.agentName}:${q.belongsTo}`;
      if (!mapGroup.has(key)) { mapGroup.set(key, []); }
      mapGroup.get(key).push(q);
    });
    if (mapGroup.size === 0) { return queries; }
    const groupsToHandle = queries.filter(q => q.group.name);
    while (groupsToHandle.length) {
      const group = groupsToHandle.shift();
      const members = mapGroup.get(`${group.taskIdentity.agentName}:${group.group.name}`);
      if (!members) { continue; }
      group.atomic.duration = { min: 0, max: 0, target: 0 };
      group.group.constraints = [];
      group.group.members = [];
      if (!members.every(m => {
        const dur = m.atomic.duration;
        if (m.group !== undefined && dur.max + dur.min + dur.target === 0) { return false; }
        this.setGroupProperty(group, m);
        return true;
      })) {
        groupsToHandle.push(group);
      }
    }
  }

  private setGroupProperty(group: AgentQuery, m: AgentQuery): void {
    const gd = group.atomic.duration;
    const md = m.atomic.duration;
    gd.max += md.max;
    gd.min += md.min;
    gd.target += md.target;
    group.group.constraints.push(...m.linkedToAll);
    group.group.members.push(m.taskIdentity.id);
    if (m.group !== undefined) {
      group.group.members.push(...m.group.members);
    }
  }

  private completeProvidersAndGroups(timeline: Placement[]): void {
    if (timeline.length === 0) { return; }
    this.resourceMapper.handleProviders(timeline.map(t => t.query), this.allQueries);
    this.preprocessingGroup(this.allQueries);
    this.areProvidersHandled.next(true);
  }

  // TODO: use DiscardUntilChange
  private queriesToPlacements(query: AgentQuery): Observable<Placement[]> {
    return Observable
      .combineLatest(
        this.ObsFromBounds.call(this, query.atomic),
        this.ObsFromProvider.call(this, query.provide),
        this.ObsFromLinkedToOne.call(this, query.linkedToOne),
        this.ObsFromLinkedToAll.call(this, query.linkedToAll),
        this.ObsFromGroup.call(this, query.group),
        this.ObsFromRelative.call(this, query.relativePos),
        this.mergeToPossiblePlace.bind(this))
      .debounceTime(0)
      .map(this.createPlacements.bind(this, query));
  }

  private mergeToBestArrangedPlacement(placementsArr: Placement[][]): Placement[] {
    placementsArr.forEach(placements => placements.forEach(this.handleNewPlacement));
    let bestSatis = this.pickBestAndSort(placementsArr);

    while (true) {
      this.optimalPlacement.arrangePlacement(bestSatis);
      const newBest = this.pickBestAndSort(placementsArr);
      if (newBest.every((p1, i) => p1 === bestSatis[i])) {
        break;
      }
      bestSatis = newBest;
    }
    return bestSatis;
  }

  private pickBestAndSort(placementsArr: Placement[][]): Placement[] {
    return placementsArr
            .map(plcmts => plcmts.reduce((p1, p2) => p1.satisfaction > p2.satisfaction ? p1 : p2))
            .sort((p1, p2) => p2.start - p1.start);
  }

  private handleNewPlacement(placement: Placement): void {
    if (placement.isNew) {
      this.optimalPlacement.arrangePlacement([placement]);
    }
  }

  private flatten<T>(arr: T[][]): T[] {
    return arr.reduce((a, b) => a.concat(b), []);
  }


  private createPlacements(query: AgentQuery, pos: PossiblePos): Placement[] {
    const placements: Placement[] = [];
    pos.start.forEach(start => {
      pos.end.forEach(end => {
        placements.push(new Placement(query, start, end));
      });
    });

    return placements;
  }

  private mergeToPossiblePlace(...markersArr: Marker[][]): PossiblePos {
    const eligibleStarters = this.mergeMarkers(markersArr, MarkerKind.Start);
    const eligibleEnders = this.mergeMarkers(markersArr, MarkerKind.End);

    return {
      start: eligibleStarters,
      end: eligibleEnders
    };
  }

  private mergeMarkers(markersArr: Marker[][], kind: MarkerKind): Marker[] {
    const sort = kind === MarkerKind.Start ? 'min' : 'max';
    const markersArrFilt = markersArr.map(markers => {
      const markersFilt = markers.filter(m => m.kind === kind || m.kind === MarkerKind.Both)
             .sort((a, b) => a.time[sort] - b.time[sort]);
      markersFilt.forEach(m => m.used = false);
      return markersFilt;
    });
    const eligibles: Marker[] = [];
    let nextMarker = this.findNextMarker(markersArrFilt);
    while (nextMarker) {
      const baseMarker = markersArrFilt[nextMarker.markersArrI][nextMarker.markersI];
      const reduced = this.cloneMarker(baseMarker, kind);
      baseMarker.used = true;
      let eligibleMarker = true;
      for (let i = 1; i < markersArrFilt.length; ++i) {
        const i_ = (i + nextMarker.markersArrI) % markersArrFilt.length;
        const marker = this.findIntersectedMarker(reduced, markersArrFilt[i_]);
        if (!marker) {
          eligibleMarker = false;
          continue;
        }
        marker.used = true;
        if (!eligibleMarker) {
          continue;
        }
        this.reduceMarkers(reduced, marker);
      }
      if (eligibleMarker) {
        eligibles.push(reduced);
      }
      nextMarker = this.findNextMarker(markersArrFilt);
    }
    return eligibles;
  }

  private reduceMarkers(reduced: Marker, marker: Marker): void {
    const min = Math.max(reduced.time.min, marker.time.min);
    const max = Math.min(reduced.time.max, marker.time.max);
    const targetPoint = this.computeTargetIntersection(reduced, marker);
    reduced.time.max = max;
    reduced.time.min = min;
    reduced.time.target = targetPoint.time;
    reduced.satisfaction *= (marker.satisfaction || 1) * targetPoint.satisfaction;
  }

  private computeTargetIntersection(m1: Marker, m2: Marker): TargetPoint {
    const t1 = m1.time;
    const t2 = m2.time;
    if (t1.target === undefined && t2.target === undefined) {
      return { satisfaction: 1, time: undefined };
    } else if (t1.target === undefined) {
      const target = this.clampTarget(t2.target, t1.min, t1.max);
      return { satisfaction: 1, time: target };
    } else if (t2.target === undefined) {
      const target = this.clampTarget(t1.target, t2.min, t2.max);
      return { satisfaction: 1, time: target };
    } else if (t1.target === t2.target) {
      return { satisfaction: 1, time: t1.target };
    }
    if (t1.target < t2.target) {
      return this.computeDeterminants(t1, t2);
    }
    return this.computeDeterminants(t2, t1);
  }

  private computeDeterminants(ear: TimeBoundary, lat: TimeBoundary): TargetPoint {
    const x1 = ear.target, y1 = 1, x2 = ear.max, y2 = 0, x3 = lat.min, y3 = 0, x4 = lat.target, y4 = 1;
    const x1y2y1x2 = x1 * y2 - y1 * x2;
    const x3x4 = x3 - x4;
    const x1x2 = x1 - x2;
    const x3y4y3x4 = x3 * y4 - y3 * x4;
    const y3y4 = y3 - y4;
    const y1y2 = y1 - y2;
    return {
      time: Math.round((x1y2y1x2 * x3x4 - x1x2 * x3y4y3x4) / (x1x2 * y3y4 - y1y2 * x3x4)),
      satisfaction: (x1y2y1x2 * y3y4 - y1y2 * x3y4y3x4) / (x1x2 * y3y4 - y1y2 * x3x4)
    };
  }

  private clampTarget(target: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, target));
  }

  private findIntersectedMarker(marker: Marker, markers: Marker[]): Marker {
    const bTime = marker.time;
    return markers.find(m => {
      const mTime = m.time;
      return (mTime.min <= bTime.min && mTime.max > bTime.min) ||
        (mTime.min < bTime.max && mTime.max >= bTime.max) ||
        (mTime.min >= bTime.min && mTime.max <= bTime.max) ||
        (mTime.min <= bTime.min && mTime.max >= bTime.max);
    });
  }

  private cloneMarker(marker: Marker, kind: MarkerKind): Marker {
    return { id: marker.id, kind: kind, satisfaction: 1, time:
      { max: marker.time.max, min: marker.time.min, target: marker.time.target }
    };
  }

  private findNextMarker(markersArr: Marker[][]): NextMarker {
    for (let i = 0; i < markersArr.length; ++i) {
      const markers = markersArr[i];
      for (let j = 0; j < markers.length; ++j) {
        const marker = markers[j];
        if (!marker.used) { return { markersArrI: i, markersI: j }; }
      }
    };
  }

  private ObsFromProvider(provide: ProvideQuery): Observable<Marker[]> {
    if (provide === undefined) { return Observable.of([]); }

    return this.areProvidersHandled.map(b => {
      if (!provide.handled || provide.higherPriority.length !== 0) {
        return this.ObsOfBanning();
      } else {
        return this.ObsFromLinkedToAll(provide.constraints);
      }
    }).switch();
  }

  private ObsFromGroup(group: Group): Observable<Marker[]> {
    if (group === undefined) { return Observable.of([]); }

    return this.areProvidersHandled.map(b => {
      if (!b) {
        return this.ObsOfBanning();
      }
      return this.ObsFromLinkedToAll(group.constraints);
    }).switch();
  }

  private ObsFromRelative(query: AgentQuery): Observable<Marker[]> {
    const relativ = query.relativePos;
    if (relativ === undefined) { return Observable.of([]); }
    return this.timeline.map(t => {
      const bounds = this.resourceMapper
        .getMatchingArea(t, query, this.minTime, this.maxTime);

      if (!bounds.length) { return this.markerOfBanning(); }

      return bounds
        .map(bound => this.getMarkersFromRelative(relativ.kind, relativ.timeElapsed, bound, 'relative'))
        .reduce((acc, v) => acc.concat(v));
    });
  }

  private markerOfBanning(): Marker[] {
    const marker: Marker = { id: 'ban', kind: MarkerKind.Both, time: { max: 0, min: 0 } };
    return [marker];
  }

  private ObsOfBanning(): Observable<Marker[]> {
    return Observable.of(this.markerOfBanning());
  }

  private ObsFromLinkedToAll(toAll: LinkTask[]): Observable<Marker[]> {
    return this.ObsFromLinkedToOne(toAll).map(markers => {
      const resultMarkers = this.mergeMarkers(
        markers.map(m => [m]), MarkerKind.Start
      ).concat(
        this.mergeMarkers(
          markers.map(m => [m]), MarkerKind.End)
      );
      if (!resultMarkers.length) { return this.markerOfBanning(); }
      return resultMarkers;
    });
  }

  private ObsFromLinkedToOne(toOne: LinkTask[]): Observable<Marker[]> {
    if (!toOne.length) { return Observable.of([]); }
    return this.timeline.map(t => {
      const markers = toOne.map(link => {
        const target = t.find(areSameTask.bind(this, link.taskIdentity));
        if (!target) { return []; }
        return this.getMarkersFromRelative(link.kind, link.timeElapsed, { start: target.start, end: target.end }, 'linkToOne');
      }).reduce((acc, v) => acc.concat(v), []);
      if (!markers.length) { return this.markerOfBanning(); }
      return markers;
    });
  }

  private getMarkersFromRelative(kind: string, timeElapsed: TimeBoundary, target: Bound, markerId: string): Marker[] {
    const baseT = kind === 'after' ? target.end : target.start;
    const startM: Marker = {
    id: markerId,
      kind: MarkerKind.Start,
      time: {
        min: baseT + timeElapsed.min < timeElapsed.max ? timeElapsed.min : timeElapsed.max,
        max: baseT + timeElapsed.max > timeElapsed.min ? timeElapsed.max : timeElapsed.min,
        target: timeElapsed.target ? baseT + timeElapsed.target : undefined
      }
    };
    const endMax = kind === 'while' ? target.end : this.maxTime;
    const endM: Marker = {
      id: markerId,
      kind: MarkerKind.End,
      time: {
        min: startM.time.min,
        max: endMax
      }
    };
    return [startM, endM];
  }

  private ObsFromBounds(atomic: AtomicTask): Observable<Marker[]> {
    const markers: Marker[] = [];
    const start = atomic.start;
    const end = atomic.start;

    markers.concat(this.handleAtomicKind(start, end, MarkerKind.Start));
    markers.concat(this.handleAtomicKind(start, end, MarkerKind.End));

    return Observable.of(markers);
  }

  private handleAtomicKind(start: TimeBoundary, end: TimeBoundary, kind: MarkerKind): Marker[] {
    const markers: Marker[] = [];
    const tb1 = kind === MarkerKind.Start ? start : end;
    const tb2 = kind === MarkerKind.Start ? end : start;
    if (tb1) {
      markers.push(this.handleAtomic(tb1, kind));
      if (!tb2) {
        const m = markers[0];
        const opositeKind = kind === MarkerKind.Start ? MarkerKind.End : MarkerKind.Start;
        const min = kind === MarkerKind.Start ? m.time.min : this.minTime;
        const max = kind === MarkerKind.Start ? this.maxTime : m.time.max;
        const opMarker: Marker = { id: 'atomic', kind: opositeKind, time: { min: min, max: max } };
        markers.push(opMarker);
      }
    }
    return markers;
  }

  private handleAtomic(t: TimeBoundary, kind: MarkerKind): Marker {
    const min = t.min ? t.min : (t.target ? t.target : this.minTime);
    const max = t.max ? t.max : (t.target ? t.target : this.maxTime);
    const marker: Marker = { id: 'atomic', kind: kind, time: { min: min, max: max, target: t.target } };
    return marker;
  }
}
