/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { addProviders, inject } from '@angular/core/testing';
import { Subject, BehaviorSubject } from 'rxjs';

import { action, stateFn, AppState, STATE_AND_DISPATCHER_PROVIDER, INIT_APP_STATE } from '../../shared';
import { ConductorService, DeliveryService, Activities } from '../shared';
import { FocusComponent } from './focus.component';

class MockConductorService {
  schedule: BehaviorSubject<Activities>;

  constructor() {
    let activities = new Activities();
    activities.push('Test', { id: 0, start: 1, end: 5, minimalDuration: 1 });
    activities.push('Test', { id: 1, start: 10, end: 15, minimalDuration: 1 });
    this.schedule = new BehaviorSubject<Activities>(activities);
  }
}

class MockDeliveryService {
  getAgent(serviceName: string) {
    if (serviceName !== 'Test') {
      throw 'incorrect service';
    }
    return {
      getInfo: (id: number) => {
        switch(id) {
          case 0:
            return 'first';
          case 1:
            return 'second';
          default:
            throw 'incorrect id';
        }
      }
    };
  }
}

describe('Component: Focus', () => {

  const actions = new Subject<action>();
  const initState: AppState = INIT_APP_STATE;
  const states = stateFn(initState, actions);

  beforeEach(() => addProviders([
    ...STATE_AND_DISPATCHER_PROVIDER,
    { provide: ConductorService, useClass: MockConductorService },
    { provide: DeliveryService, useClass: MockDeliveryService },
    FocusComponent
  ]));

  it('should create an instance', inject([FocusComponent], (focus: FocusComponent) => {
    expect(focus).toBeTruthy();
  }));

  it('should get first task', inject([FocusComponent], (focus: FocusComponent) => {
    focus.firstActivity.subscribe(s => expect(s).toEqual('first'))
  }));
});
