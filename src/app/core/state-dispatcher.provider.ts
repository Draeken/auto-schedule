import { OpaqueToken }          from '@angular/core';
import { Subject, Observable }  from 'rxjs';

import { initAppState } from './init-app-state.function';
import { stateFn }      from './app-state.function';
import { action }       from '../shared/actions';
import { AppState }     from '../shared/app-state.interface';

export const initState = new OpaqueToken('init.state');
export const dispatcher = new OpaqueToken('dispatcher');
export const state = new OpaqueToken('state');

export function dispatcherSubject() {
  return new Subject<action>();
}

export const stateAndDispatcherProvider = [
  {
    provide: initState,
    useFactory: initAppState
  },
  {
    provide: dispatcher,
    useFactory: dispatcherSubject
  },
  {
    provide: state,
    useFactory: stateFn,
    deps: [initState, dispatcher]
  }
];
