import { Injectable, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { Agent, DeliveryService, Activity, Activities } from './';
import { DISPATCHER, STATE, action, AppState } from '../../shared';

type state = { activities: Activity[] };

@Injectable()
export class ConductorService {
  schedule: Observable<Activities>;

  constructor(private delivery: DeliveryService,
              @Inject(DISPATCHER) private dispatcher: Observer<action>,
              @Inject(STATE) private state: Observable<AppState>) {
    this.schedule = this.state
      .map(s => ({ activities: s.activities }))
      .distinctUntilChanged(this.areStatesDistincts)
      .map(this.buildSchedule);
  }

  /**
   * TODO: Test without this function (default equality)
   */
  private areStatesDistincts(x: state, y: state): boolean {
    const ax = x.activities;
    const ay = y.activities;

    if (ax.length !== ay.length) {
      return true;
    }
    for (let i = 0; i < ax.length; ++i) {
      if (ax[i] !== ay[i]) {
        return true;
      }
    }
    return false;
  }

  private buildSchedule(state: state): Activities {
    return null;
  }
}
