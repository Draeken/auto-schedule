import { Injectable, Inject } from '@angular/core';
import { Observable, Observer, BehaviorSubject } from 'rxjs';

import { ConflictHandlerService } from './conflict-handler.service';
import { DataIOService } from '../../core/data-io.service';
import { DeliveryService } from './delivery.service';
import { Activity } from './activity.interface';
import { Activities, Marker } from './activities.class';
import { Service, distinctServices } from './service';
import { ServiceQuery } from './service-query.interface';
import { Task } from './task.interface';
import { action } from '../../shared/actions';
import { AppState } from '../../shared/app-state.interface';
import { dispatcher, state } from '../../core/state-dispatcher.provider';

type state = { activities: Activity[] };
const TIMELINE_DEBOUNCE_TIME = 80;

@Injectable()
export class ConductorService {
  schedule = new BehaviorSubject<Activities>(new Activities());

  private timeoutActivity: NodeJS.Timer;
  private serviceObservable = new Map<string, BehaviorSubject<ServiceQuery[]>>();

  constructor(private dataIO: DataIOService,
              private delivery: DeliveryService,
              private conflictHandler: ConflictHandlerService,
              @Inject(dispatcher) private dispatcher: Observer<action>,
              @Inject(state) private state: Observable<AppState>) {
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

  /**
   * Refactor to handle array of tasks
   */
  private registerEndActivity(activities: Activities) {
    const firstTask = activities.firstTasks[0];
    if (firstTask.start <= Date.now()) {
      // Save it
      console.log(`task.start <= date.now`, firstTask);
    }
    this.dataIO.saveCurrentTask(firstTask);
    const timeToEnd = firstTask.end - Date.now();
    if (timeToEnd < 0) {
      return this.makeThisTimeCount(firstTask);
    }
    const toDo = () => this.makeThisTimeCount(firstTask);
    clearTimeout(this.timeoutActivity);
    this.timeoutActivity = setTimeout(toDo, timeToEnd);
  }

  private makeThisTimeCount(task: Task): void {
    console.log('Time left for task ', task);
    this.delivery.getAgent(task.serviceName).endTask(task);
  }

  private restoreCurrentActivity(activities: Activities): void {
    const task = this.dataIO.retrieveCurrentTask();
    if (task.end < Date.now()) {
      return;
    }
    const sName = task.serviceName;
    const sQuery: ServiceQuery = {
      id: task.id,
      start: task.start,
      end: task.end,
      minimalDuration: 0
    };
    activities.push(sName, sQuery);
  }

  private timelineBuilder(queries: ServiceQuery[][]): Activities {
    let activities = new Activities();
    let serviceNames = this.serviceObservable.keys();
    queries.forEach(squeries => {
      let serviceName = serviceNames.next().value;
      squeries.forEach(query => activities.push(serviceName, query));
    });
    this.restoreCurrentActivity(activities);
    return activities;
  }

  private allocationObsFor(timeline: Observable<Activities>, serviceName: string): Observable<Marker[]> {
    return timeline
      .map(a => a.filter(serviceName))
      .distinctUntilChanged((x, y) => Activities.distinctMarkers(x, y));
  }

  /**
   * Delete old services and add new one to the serviceObservable map
   */
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
