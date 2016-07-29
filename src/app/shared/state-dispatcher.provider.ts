import { OpaqueToken } from '@angular/core';
import { Inject } from '@angular/core';

import { Subject } from 'rxjs';

import { INIT_APP_STATE } from './app-state.interface'
import { action, stateFn } from './actions'

export const INIT_STATE = new OpaqueToken("initState");
export const DISPATCHER = new OpaqueToken("dispatcher");
export const STATE = new OpaqueToken("state");

export const STATE_AND_DISPATCHER = [
  {
    provide: INIT_STATE,
    useValue: INIT_APP_STATE
  },
  {
    provide: DISPATCHER,
    useValue: new Subject<action>(null)
  },
  {
    provide: STATE,
    useFactory: stateFn,
    deps: [new Inject(INIT_STATE), new Inject(DISPATCHER)]
  }
]
