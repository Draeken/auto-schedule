import { Injectable, Inject } from '@angular/core';
import { Observable, Observer, BehaviorSubject, Subject } from 'rxjs';

import { ConflictHandlerService, DeliveryService, Activity, Activities, Marker,  Service, ServiceQuery, Task, distinctServices } from './index';
import { DISPATCHER, STATE, APP_CONFIG, action, AppState, DataIO } from '../../shared';

type state = { activities: Activity[] };
const TIMELINE_DEBOUNCE_TIME = 80;

@Injectable()
export class ConductorService {
  schedule = new BehaviorSubject<Activities>(new Activities());

  private timeoutActivity: NodeJS.Timer;
  private serviceObservable = new Map<string, BehaviorSubject<ServiceQuery[]>>();

  constructor(private delivery: DeliveryService,
              private dataIO: DataIO,
              private conflictHandler: ConflictHandlerService,
              @Inject(DISPATCHER) private dispatcher: Observer<action>,
              @Inject(STATE) private state: Observable<AppState>,
              @Inject(APP_CONFIG) private config) {
    this.state
      .pluck('services')
      .distinctUntilChanged(distinctServices)
      .do(this.mapServices.bind(this))
      .subscribe(this.registerServices.bind(this));
  }

  private registerServices(services: Service[]): void {
    let rawTimelineObs: Observable<ServiceQuery[][]> = Observable.combineLatest(
      Array.from(this.serviceObservable.values()), (x, y) => [x, y]);
    const conflictResolver: (Activities) => Activities = this.conflictHandler.tryToResolveConflicts.bind(this.conflictHandler);
    let timelineObs: Observable<Activities> = rawTimelineObs
      .debounceTime(TIMELINE_DEBOUNCE_TIME)
      .map(this.timelineBuilder.bind(this))
      .map(conflictResolver)
      .filter((t: Activities) => t.hasNoConflict)
      .do(this.registerEndActivity.bind(this));
    timelineObs.subscribe(this.schedule);
    services.forEach(s => {
      this.delivery.getAgent(s.name).setConductorRegistration(
        this.allocationObsFor(timelineObs, s.name),
        this.serviceObservable.get(s.name)
      );
    });
  }

  private registerEndActivity(activities: Activities) {
    const firstTask = activities.firstTask;
    if (firstTask.start <= Date.now()) {
      //Save it
    }
    const timeToEnd = firstTask.end - Date.now();
    if (timeToEnd < 0) {
      return;
    }
    const toDo = () => this.makeThisTimeCount(firstTask);
    clearTimeout(this.timeoutActivity);
    this.timeoutActivity = setTimeout(toDo, timeToEnd);
  }

  private makeThisTimeCount(task: Task): void {
    console.log('Time left for task ', task);
    this.delivery.getAgent(task.serviceName).endTask(task);
  }

  private timelineBuilder(queries: ServiceQuery[][]): Activities {
    let activities = new Activities();
    let serviceNames = this.serviceObservable.keys();
    queries.forEach(squeries => {
      let serviceName = serviceNames.next().value;
      squeries.forEach(query => activities.push(serviceName, query));
    });
    return activities;
  }

  private allocationObsFor(timeline: Observable<Activities>, serviceName: string): Observable<Marker[]> {
    return timeline
      .map(a => a.filter(serviceName))
      .distinctUntilChanged((x, y) => Activities.distinctMarkers(x, y));
  }

  private mapServices(services: Service[]): void {
    this.serviceObservable.forEach((ob, key) => {
      if (services.findIndex(s => s.name === key) === -1) {
        this.serviceObservable.delete(key);
      }
    });
    services.forEach(s => {
      if (this.serviceObservable.has(s.name)) {
        return;
      }
      this.serviceObservable.set(s.name, new BehaviorSubject<ServiceQuery[]>([]));
    });
  }
}
