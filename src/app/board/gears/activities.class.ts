import { Task, TaskStatus }         from './task.interface';
import { TaskTransform }         from './agent-query.interface';
import { AgentQuery } from './agent-query.interface';

export interface Marker {
  time: number;
  query: AgentQuery;
};

export class Activities {
  private markers: Marker[] = [];
  private hasConflict = false;
  private fuzzyQueries: Map<string, AgentQuery[]> = new Map<string, AgentQuery[]>();

  static distinctMarkers(x: Marker[], y: Marker[]): boolean {
    if (x.length !== y.length) {
      return false;
    }
    for (let i = 0; i < x.length; ++i) {
      if (x[i].query.id !== y[i].query.id || x[i].time !== y[i].time) {
        return false;
      }
    }
    return true;
  }

  constructor() {}

  push(q: AgentQuery): void {
    let agentName = q.agentName;
    if (this.isFuzzy(q)) {
      if (this.fuzzyQueries.has(agentName)) {
        this.fuzzyQueries.get(agentName).push(q);
      } else {
        this.fuzzyQueries.set(agentName, [q]);
      }
      return;
    }
    this.putMarkers(q);
  }

  filter(agentName: string): Marker[] {
    return this.markers.filter(m => m.query.agentName === agentName);
  }

  toArray(): Task[] {
    return this.firstTasks;
  }

  get fuzzyEntries(): Iterator<[string, AgentQuery[]]> {
    return this.fuzzyQueries.entries();
  }

  get hasNoConflict(): boolean {
    //Should shake that their is no "draft" tasks
    return !this.hasConflict;
  }

  get firstTasks(): Task[] {
    if (!this.markers.length) {
      console.warn('No markers');
      return [];
    }
    let firstTasks: Task[] = [];
    let markerI = 0;
    let markerSearch: Marker[] = [this.markers[markerI++]];
    let addToFirst = (mStart: Marker, mEnd: Marker) => firstTasks.push(
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
        let mStart: Marker = markerSearch.splice(siblingMarkerI, 1)[0];
        addToFirst(mStart, marker);
      } else {
        markerSearch.push(marker);
      }
    }
    return firstTasks;
  }

  getHoles(biggerThan = 1000): [Marker, Marker][] {
    if (!this.markers.length) {
      return [];
    }
    let result: [Marker, Marker][] = [];
    let setMarker: { sn: string, id: number }[] = [];
    result.push([null, this.markers[0]]);
    this.markers.forEach((marker, ind, arr) => {
      const prevLength = setMarker.length;
      let i = setMarker.findIndex(m => m.sn === marker.query.agentName && m.id === marker.query.id);
      if (i !== -1) {
        setMarker.splice(i, 1);
      } else {
        setMarker.push({ sn: marker.query.agentName, id: marker.query.id });
      }
      if (prevLength + setMarker.length === 1 && ind > 0) {
        const prevMarker = arr[ind - 1];
        if (marker.time - prevMarker.time > biggerThan) {
          result.push([prevMarker, marker]);
        }
      }
    });
    result.push([this.markers[this.markers.length - 1], null]);
    return result;
  }

  private isFuzzy(q: AgentQuery): boolean {
    return (!q.start || !q.start) && !q.duration;
  }

  private pushMarker(query: AgentQuery, time: number): void {
    let marker = { time: time, query: query };
    let i = this.markers.findIndex(m => m.time > time);
    if (i !== -1) {
      this.markers.splice(i, 0, marker);
    } else {
      this.markers.push(marker);
    }
  }

  public putMarkers(q: AgentQuery): void {
    let start = q.start;
    let end = q.end;
    if (start) {
      this.pushMarker(q, start);
      if (q.duration && !end) {
        end = start + q.duration;
      }
    }
    this.pushMarker(q, end);
    if (q.duration && !start) {
      start = end - q.duration;
      this.pushMarker(q, start);
    }
  }
}
