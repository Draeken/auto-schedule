import { OpaqueToken } from '@angular/core';
import { Subject } from 'rxjs';

import { initAppState, action, stateFn } from './index';

export const INIT_STATE = new OpaqueToken('init.state');
export const DISPATCHER = new OpaqueToken('dispatcher');
export const STATE = new OpaqueToken('state');

export const STATE_AND_DISPATCHER_PROVIDER = [
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
    deps: [INIT_STATE, DISPATCHER]
  }
];
