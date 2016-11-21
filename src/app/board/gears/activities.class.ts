import { Task }         from './task.interface';
import { ServiceQuery } from './service-query.interface';

export interface Marker {
  serviceName: string;
  taskId: number;
  time: number;
};

export class Activities {
  private markers: Marker[] = [];
  private hasConflict = false;
  private fuzzyQueries: Map<string, ServiceQuery[]> = new Map<string, ServiceQuery[]>();

  static distinctMarkers(x: Marker[], y: Marker[]): boolean {
    if (x.length !== y.length) {
      return true;
    }
    for (let i = 0; i < x.length; ++i) {
      if (x[i].taskId !== y[i].taskId || x[i].time !== y[i].time) {
        return true;
      }
    }
    return false;
  }

  constructor() {}

  push(serviceName: string, q: ServiceQuery): void {
    if (this.isFuzzy(q)) {
      if (this.fuzzyQueries.has(serviceName)) {
        this.fuzzyQueries.get(serviceName).push(q);
      } else {
        this.fuzzyQueries.set(serviceName, [q]);
      }
      return;
    }
    this.putMarkers(serviceName, q);
  }

  filter(serviceName: string): Marker[] {
    return this.markers.filter(m => m.serviceName === serviceName);
  }

  get fuzzyEntries(): Iterator<[string, ServiceQuery[]]> {
    return this.fuzzyQueries.entries();
  }

  get hasNoConflict(): boolean {
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
        id: mStart.taskId,
        start: mStart.time,
        serviceName: mStart.serviceName,
        end: mEnd.time
      });
    while (markerSearch.length > 0) {
      const marker = this.markers[markerI];
      const siblingMarkerI = markerSearch.findIndex(m => m.taskId === marker.taskId && m.serviceName === marker.serviceName);
      if (siblingMarkerI !== -1) {
        let mStart: Marker = markerSearch.splice(siblingMarkerI, 1)[0];
        addToFirst(mStart, marker);
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
      let i = setMarker.findIndex(m => m.sn === marker.serviceName && m.id === marker.taskId);
      if (i !== -1) {
        setMarker.splice(i, 1);
      } else {
        setMarker.push({ sn: marker.serviceName, id: marker.taskId });
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

  private isFuzzy(q: ServiceQuery): boolean {
    return (!q.start || !q.start) && !q.duration;
  }

  private pushMarker(serviceName: string, taskId: number, time: number): void {
    let marker = { serviceName: serviceName, taskId: taskId, time: time };
    let i = this.markers.findIndex(m => m.time > time);
    if (i !== -1) {
      this.markers.splice(i, 0, marker);
    } else {
      this.markers.push(marker);
    }
  }

  public putMarkers(sn: string, q: ServiceQuery): void {
    let start = q.start;
    let end = q.end;
    if (start) {
      this.pushMarker(sn, q.id, start);
      if (q.duration && !end) {
        end = start + q.duration;
        this.pushMarker(sn, q.id, end);
      }
    }
    if (end) {
      this.pushMarker(sn, q.id, end);
      if (q.duration && !start) {
        start = end - q.duration;
        this.pushMarker(sn, q.id, start);
      }
    }
  }
}
