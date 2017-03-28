import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { Task, TaskStatus } from './task.interface';
import { TaskTransform } from './agent-query.interface';
import { AgentQuery, TimeBoundary, AtomicTask } from './agent-query.interface';

interface Placement {
  start: number;
  end: number;
  satisfaction: number;
  query: AgentQuery;
};

enum MarkerKind {
  Start,
  End,
  Both
}

interface Marker {
  min: number;
  max: number;
  target?: number;
  id: string;
  kind: MarkerKind;
}

export class Timeline {
  private queriesObs: Map<string, Observable<Placement>> = new Map();
  private timeline: Observable<Placement[]>;
  private userState: Observable<Object>;
  private timelineMarkers: Observable<Marker[]>;
  private minTime = Date.now();
  private maxTime = Date.now() + 3600000 * 24 * 14;

  constructor(allQueries: AgentQuery[]) {
    this.timelineMarkers = Observable.of([
      { min: this.minTime, max: this.maxTime, id: 'timeline', kind: MarkerKind.Both }
    ]);
    allQueries.forEach(query => {
      this.queriesObs.set(query.agentName + query.id, new Subject());
    });
    this.timeline = Observable.combineLatest(...this.queriesObs.values(),
      (...queries: Placement[]) => queries.sort((x, y) => x.end - y.end)).startWith([]);
    allQueries.forEach(this.placeQuery, this);
  }

  private placeQuery(query: AgentQuery): void {

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
    return Observable.combineLatest(observables);
  }

  private handleAtomic(t: TimeBoundary, kind: MarkerKind): Observable<Marker> {
    const min = t.min ? t.min : (t.tartgetTime ? t.tartgetTime : this.minTime);
    const max = t.max ? t.max : (t.tartgetTime ? t.tartgetTime : this.maxTime);
    const marker: Marker = { id: 'atomic', kind: kind, min: min, max: max, target: t.tartgetTime };
    return new BehaviorSubject(marker);
  }
}
