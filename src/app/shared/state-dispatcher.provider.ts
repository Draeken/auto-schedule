import { OpaqueToken } from '@angular/core';
import { Inject } from '@angular/core';
import { Subject } from 'rxjs';

import { initAppState, action, stateFn } from './';

export const INIT_STATE = new OpaqueToken('initState');
export const DISPATCHER = new OpaqueToken('dispatcher');
export const STATE = new OpaqueToken('state');

export const STATE_AND_DISPATCHER = [
  {
    provide: INIT_STATE,
    useFactory: initAppState
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
];
