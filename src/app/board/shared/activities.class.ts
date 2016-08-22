import { Task, ServiceQuery } from './';

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

  get hasNoConflict(): boolean {
    return !this.hasConflict;
  }

  get firstTask(): Task {
    if (!this.markers.length) {
      return null;
    }
    const firstMarker = this.markers[0];
    const id = firstMarker.taskId;
    const serviceName = firstMarker.serviceName;
    const start = firstMarker.time;
    const end = this.markers.find(m => m.taskId === id && m.serviceName === serviceName && m !== firstMarker).time;
    return {
      id: id,
      start: start,
      serviceName: serviceName,
      end: end
    };
  }

  private isFuzzy(q: ServiceQuery): boolean {
    return (!q.start || !q.duration);
  }

  private putMarkers(sn: string, q: ServiceQuery): void {
    let start = q.start;
    let end = q.end;
    if (start) {
      this.markers.push({ serviceName: sn, taskId: q.id, time: start });
      if (q.duration && !end) {
        end = start + q.duration;
        this.markers.push({ serviceName: sn, taskId: q.id, time: end });
      }
    }
    if (end) {
      this.markers.push({ serviceName: sn, taskId: q.id, time: end });
      if (q.duration && !start) {
        start = end - q.duration;
        this.markers.push({ serviceName: sn, taskId: q.id, time: start });
      }
    }
  }
}
