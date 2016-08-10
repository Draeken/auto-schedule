import { Injectable, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { Agent, DeliveryService, Activity, Activities, Service, ConstraintsHandler } from './';
import { DISPATCHER, STATE, APP_CONFIG, action, AppState } from '../../shared';

type state = { activities: Activity[] };

@Injectable()
export class ConductorService {
  schedule: Observable<Activities>;

  private serviceObservable: Map<string, Observable<any>>;

  constructor(private delivery: DeliveryService,
              @Inject(DISPATCHER) private dispatcher: Observer<action>,
              @Inject(STATE) private state: Observable<AppState>,
              @Inject(APP_CONFIG) private config) {
    this.state
      .pluck('services')
      .distinctUntilChanged(this.areArrayDistincts)
      .map(this.mapServices);
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
      this.serviceObservable.set(s.name, this.observableFor(s.name));
    });
  }

  private observableFor(serviceName: string): Observable<any> {
    return this.state
      .map(s => {
        const activities = s.activities.filter(a => a.responsible.name === serviceName);
        return { activities: activities };
      })
      .distinctUntilChanged(this.areStatesDistincts)
      .map(this.buildSchedule);
  };

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

  /**
   * TODO: Test without this function (default equality)
   */
  private areStatesDistincts(x: state, y: state): boolean {
    const ax = x.activities;
    const ay = y.activities;

    return this.areArrayDistincts(ax, ay);
  }

  private buildSchedule(state: state): any {
    let constHandler = new ConstraintsHandler(this.config, state.activities);
    return constHandler;
  }
}
