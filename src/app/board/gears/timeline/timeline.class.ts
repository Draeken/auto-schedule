import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { Task, TaskStatus } from '../task.interface';
import { AgentQuery,
         TimeBoundary,
         AtomicTask,
         TaskTransform } from '../agent-query.interface';
import { Placement } from './placement.class';
import { arrangePlacement } from './optimal-placement.function';

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

  constructor(allQueries: AgentQuery[]) {
    this.timelineMarkers = Observable.of([
      { time: { min: this.minTime, max: this.maxTime }, id: 'timeline', kind: MarkerKind.Both }
    ]);
    Observable
      .combineLatest(allQueries.map(this.queriesToPlacements.bind(this)), this.mergeToBestArrangedPlacement)
      .map(placements => placements.sort((x, y) => x.end - y.end))
      .subscribe(placements => this.timeline.next(placements));
  }

  private queriesToPlacements(query: AgentQuery): Observable<Placement[]> {
    return Observable
      .combineLatest(
        this.ObsFromAtomic.call(this, query.atomic),
        this.mergeToPossiblePlace.bind(this))
      .map(this.createPlacements.bind(this, query));
  }

  private mergeToBestArrangedPlacement(placementsArr: Placement[][]): Placement[] {
    placementsArr.forEach(placements => placements.forEach(this.handleNewPlacement));
    let bestSatis = placementsArr.map(plcmts => plcmts.reduce((p1, p2) => p1.satisfaction > p2.satisfaction ? p1 : p2));

    while (true) {
      arrangePlacement(bestSatis);
      const newBest = placementsArr.map(plcmts => plcmts.reduce((p1, p2) => p1.satisfaction > p2.satisfaction ? p1 : p2));
      if (newBest.every((p1, i) => p1 === bestSatis[i])) {
        break;
      }
      bestSatis = newBest;
    }
    return bestSatis;
  }

  private handleNewPlacement(placement: Placement): void {
    if (placement.isNew) {
      arrangePlacement([placement]);
    }
  }

  private flatten<T>(arr: T[][]): T[] {
    return arr.reduce((a, b) => a.concat(b), []);
  }


  private createPlacements(query: AgentQuery, pos: PossiblePos): Placement[] {
    const placements: Placement[] = [];
    pos.start.forEach(start => {
      pos.end.forEach(end => {
        placements.push(new Placement(start, end, query));
      });
    });

    return placements;
  }

  private mergeToPossiblePlace(...markersArr: Marker[][]): PossiblePos {
    const starters = markersArr.map(markers => {
      markers.map(m => m.used = false);
      return markers.filter(m => m.kind === MarkerKind.Start || m.kind === MarkerKind.Both)
             .sort((a, b) => a.time.min - b.time.min);
      });
    const eligibleStarters = this.mergeMarkers(starters, MarkerKind.Start);

    const enders = markersArr.map(markers => {
      markers.map(m => m.used = false);
      return markers.filter(m => m.kind === MarkerKind.End || m.kind === MarkerKind.Both)
             .sort((a, b) => a.time.max - b.time.max);
      });
    const eligibleEnders = this.mergeMarkers(starters, MarkerKind.End);

    return {
      start: eligibleStarters,
      end: eligibleEnders
    };
  }

  private mergeMarkers(markersArr: Marker[][], kind: MarkerKind): Marker[] {
    const eligibles: Marker[] = [];
    let nextMarker = this.findNextMarker(markersArr);
    while (nextMarker) {
      const baseMarker = markersArr[nextMarker.markersArrI][nextMarker.markersI];
      const reduced = this.cloneMarker(baseMarker, kind);
      baseMarker.used = true;
      let eligibleMarker = true;
      for (let i = 1; i < markersArr.length; ++i) {
        const i_ = (i + nextMarker.markersArrI) % markersArr.length;
        const marker = this.findIntersectedMarker(reduced, markersArr[i_]);
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
      nextMarker = this.findNextMarker(markersArr);
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

  private ObsFromAtomic(atomic: AtomicTask): Observable<Marker[]> {
    const observables: Observable<Marker>[] = [];
    const start = atomic.start;
    const end = atomic.start;
    if (start) {
      observables.push(this.handleAtomic(start, MarkerKind.Start));
    }
    if (end) {
      observables.push(this.handleAtomic(end, MarkerKind.End));
    }
    return Observable.combineLatest(observables).startWith([]);
  }

  private handleAtomic(t: TimeBoundary, kind: MarkerKind): Observable<Marker> {
    const min = t.min ? t.min : (t.target ? t.target : this.minTime);
    const max = t.max ? t.max : (t.target ? t.target : this.maxTime);
    const marker: Marker = { id: 'atomic', kind: kind, time: { min: min, max: max, target: t.target } };
    return new BehaviorSubject(marker);
  }
}
