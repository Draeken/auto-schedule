import { Task, TaskStatus } from './task.interface';
import { TaskTransform } from './agent-query.interface';
import { AgentQuery, TimeBoundary } from './agent-query.interface';

export interface Marker {
  time: number;
  query: AgentQuery;
  previousMarker?: Marker;
  nextMarker?: Marker;
};

interface LinkQuery {
  offset: TimeBoundary;
  agentQuery: AgentQuery;
}

export class Activities {
  private markerHead: Marker;
  private markers: Marker[] = [];
  private hasConflict = false;
  private atomicQueries: AgentQuery[] = [];
  private atomicObservingQueries: AgentQuery[] = [];
  private diffuseQueries: AgentQuery[] = [];
  private taskToProviders: Map<AgentQuery, AgentQuery[]> = new Map();
  private queriesLink: Map<AgentQuery, LinkQuery[]> = new Map();

  constructor(private allQueries: AgentQuery[]) {
    const queriesToHandle = allQueries.slice();
    this.sortQuery(queriesToHandle);
    this.placeAtomic();
  }

  private placeAtomic(): void {
    this.atomicQueries.forEach(query => {
      let start = query.atomic.start ? query.atomic.start.tartgetTime : undefined;
      let end = query.atomic.end ? query.atomic.end.tartgetTime : undefined;
      const duration = query.atomic.duration ? query.atomic.duration.tartgetTime : undefined;
      if (start) {
        this.pushMarker(query, start);
        if (duration && !end) {
          end = start + duration;
        }
      }
      this.pushMarker(query, end);
      if (duration && !start) {
        start = end - duration;
        this.pushMarker(query, start);
      }
      if (!query.linkedTo) { return; }
      // this.queriesLink.get(query).forEach()
    });
  }

  private placeRelative(baseQuery: AgentQuery, nextQuery: LinkQuery): void {
    const queryToPlace = nextQuery.agentQuery;
  }

  private sortQuery(queries: AgentQuery[]): void {
    queries.forEach(query => {
      this.handleLinksFromList(query, queries);
      if (this.queryIsProviding(query)) { return this.pushProviderToMap(query, queries); }
      if (this.queryIsAtomicStrict(query)) { this.atomicQueries.push(query); }
      if (this.queryIsAtomicObserving(query)) { return this.atomicObservingQueries.push(query); }
      if (this.queryIsDiffuse(query)) { return this.diffuseQueries.push(query); }
    });
  }

  /**
   * Queries has to be sorted so links never reference a backward query.
   */
  private handleLinksFromList(query: AgentQuery, queries: AgentQuery[]): void {
    if (!query.linkedTo) { return; }
    const mapLinkFn = l => ({ taskId: l.taskId, source: query, offset: l.offset });
    const nextLinks = query.linkedTo.map(mapLinkFn);

    while (nextLinks.length) {
      const curLink = nextLinks.shift();
      const curQueryI = queries.findIndex(q => q.agentName === query.agentName && q.id === curLink.taskId);
      if (curQueryI === -1) { continue; }
      const curQuery = queries.splice(curQueryI, 1)[0];
      if (!this.queriesLink.has(curLink.source)) { this.queriesLink.set(curLink.source, []); }
      this.queriesLink.get(curLink.source).push({ offset: curLink.offset, agentQuery: curQuery });
      if (!curQuery.linkedTo) { continue; }
      nextLinks.push(...curQuery.linkedTo.map(mapLinkFn));
    }
  }

  private pushProviderToMap(query: AgentQuery, queries: AgentQuery[]): void {
    const baseQuery = this.allQueries.find(q => q.agentName === query.provide.provideAgent
      && q.id === query.provide.provideTask);
    if (!baseQuery) {
      console.warn(`Provide for unexisting need.`);
      return;
    }
    if (!this.taskToProviders.has(baseQuery)) { this.taskToProviders.set(baseQuery, []); }
    const providers = this.taskToProviders.get(baseQuery);
    providers.push(query);
  }

  private queryIsProviding(query: AgentQuery): boolean {
    return query.provide !== undefined;
  }

  private queryIsDiffuse(query: AgentQuery): boolean {
    return query.diffuse !== undefined;
  }

  private queryIsAtomicStrict(query: AgentQuery): boolean {
    return query.atomic !== undefined &&
        (query.atomic.start.tartgetTime !== undefined &&
          (query.atomic.end.tartgetTime !== undefined || query.atomic.duration.tartgetTime !== undefined) ||
        (query.atomic.end.tartgetTime !== undefined &&
          (query.atomic.start.tartgetTime !== undefined || query.atomic.duration.tartgetTime !== undefined)));
  }

  private queryIsAtomicObserving(query: AgentQuery): boolean {
    return query.atomic !== undefined &&
      query.relativePos !== undefined;
  }

  filter(agentName: string): Marker[] {
    return this.markers.filter(m => m.query.agentName === agentName);
  }

  toArray(): Task[] {
    return this.firstTasks;
  }

  get hasNoConflict(): boolean {
    // Should shake that their is no "draft" tasks
    return !this.hasConflict;
  }

  get firstTasks(): Task[] {
    if (!this.markers.length) {
      console.warn('No markers');
      return [];
    }
    const firstTasks: Task[] = [];
    let markerI = 0;
    const markerSearch: Marker[] = [this.markers[markerI++]];
    const addToFirst = (mStart: Marker, mEnd: Marker) => firstTasks.push(
      {
        start: mStart.time,
        end: mEnd.time,
        status: TaskStatus.Sleep,
        query: mStart.query,
      });
    while (markerSearch.length > 0) {
      const marker = this.markers[markerI++];
      const siblingMarkerI = markerSearch.findIndex(m => m.query.id === marker.query.id && m.query.agentName === marker.query.agentName);
      if (siblingMarkerI !== -1) {
        const mStart: Marker = markerSearch.splice(siblingMarkerI, 1)[0];
        addToFirst(mStart, marker);
      } else {
        markerSearch.push(marker);
      }
    }
    return firstTasks;
  }

  private pushMarker(query: AgentQuery, time: number): void {
    const marker: Marker = { time: time, query: query };
    if (!this.markerHead) {
      this.markerHead = marker;
      return;
    }
    let nextMarker = this.markerHead;
    while (nextMarker.time < time && nextMarker.nextMarker) {
      nextMarker = nextMarker.nextMarker;
    }
    if (nextMarker.time > time) {
      const prevMarker = nextMarker.previousMarker;
      if (prevMarker) {
        prevMarker.nextMarker = marker;
        marker.previousMarker = prevMarker;
      }
      nextMarker.previousMarker = marker;
      marker.nextMarker = nextMarker;
    } else {
      nextMarker.nextMarker = marker;
      marker.previousMarker = nextMarker;
    }
  }
}
