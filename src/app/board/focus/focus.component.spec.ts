/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { addProviders, inject } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { action, stateFn, AppState, STATE_AND_DISPATCHER, INIT_APP_STATE } from '../../shared';
import { FocusComponent } from './focus.component';

describe('Component: Focus', () => {

  const actions = new Subject<action>();
  const initState: AppState = INIT_APP_STATE;
  const states = stateFn(initState, actions);

  beforeEach(() => addProviders([...STATE_AND_DISPATCHER, FocusComponent]));

  it('should create an instance', inject([FocusComponent], (focus: FocusComponent) => {
    expect(focus).toBeTruthy();
  }));
});
