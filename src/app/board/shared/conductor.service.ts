import { Injectable, Inject } from '@angular/core';
import { Observable, Observer, BehaviorSubject } from 'rxjs';

import { Agent, DeliveryService, Activity, Activities, Service, ServiceQuery } from './';
import { DISPATCHER, STATE, APP_CONFIG, action, AppState } from '../../shared';

type state = { activities: Activity[] };

@Injectable()
export class ConductorService {
  schedule: BehaviorSubject<Activities>;

  private serviceObservable: Map<string, BehaviorSubject<ServiceQuery[]>>;

  constructor(private delivery: DeliveryService,
              @Inject(DISPATCHER) private dispatcher: Observer<action>,
              @Inject(STATE) private state: Observable<AppState>,
              @Inject(APP_CONFIG) private config) {
    this.state
      .pluck('services')
      .distinctUntilChanged(this.areArrayDistincts)
      .do(this.mapServices)
      .map(this.registerServices);
  }

  private registerServices(services: Service[]): void {
    let timelineObs = Observable.combineLatest(
      Array.from(this.serviceObservable.values()),
      this.timelineBuilder)
      .map(this.tryToResolveConflicts)
      .filter(this.isTimelineWithoutConflict);
    timelineObs.subscribe(this.schedule);
    services.forEach(s => {
      this.delivery.getAgent(s.name).setConductorRegistration(
        this.allocationObsFor(timelineObs, s.name),
        this.serviceObservable.get(s.name)
      );
    });
  }

  private isTimelineWithoutConflict(timeline: Activities): boolean {
    return true;
  }

  private timelineBuilder(queries: ServiceQuery[][]): Activities {
    let activities = new Activities;
    let serviceNames = this.serviceObservable.keys();
    queries.forEach(squeries => {
      let serviceName = serviceNames.next().value;
      squeries.forEach(query => activities.push(serviceName, query));
    });
    return activities;
  }

  private tryToResolveConflicts(timeline: Activities): Activities {
    return timeline;
  }

  private allocationObsFor(timeline: Observable<Activities>, serviceName: string): Observable<Activities> {
    return timeline
      .map(a => a.filter(serviceName))
      .distinctUntilChanged((x, y) => x.similar(y));
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

  private areArrayDistincts(x: Array<any>, y: Array<any>): boolean {
    if (!x && !y) {
      return false;
    } else if (!x || !y) {
      return true;
    }
    if (x.length !== y.length) {
      return true;
    }
    for (let i = 0; i < x.length; ++i) {
      if (x[i] !== y[i]) {
        return true;
      }
    }
    return false;
  }
}
