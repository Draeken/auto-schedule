import { OpaqueToken }  from '@angular/core';
import { Subject }      from 'rxjs';

import { initAppState } from './init-app-state.function';
import { stateFn }      from './app-state.function';
import { action }       from '../shared/actions';

export const initState = new OpaqueToken('init.state');
export const dispatcher = new OpaqueToken('dispatcher');
export const state = new OpaqueToken('state');

export const stateAndDispatcherProvider = [
  {
    provide: initState,
    useFactory: initAppState
  },
  {
    provide: dispatcher,
    useValue: new Subject<action>()
  },
  {
    provide: state,
    useFactory: stateFn,
    deps: [initState, dispatcher]
  }
];
