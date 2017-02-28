import { OpaqueToken }          from '@angular/core';
import { Subject, Observable }  from 'rxjs';

import { initAppState } from './init-app-state.function';
import { stateFn }      from './app-state.function';
import { AppAction }       from './actions';
import { AppState }     from './app-state.interface';

export const initState = new OpaqueToken('init.state');
export const appDispatcher = new OpaqueToken('dispatcher');
export const appState = new OpaqueToken('state');

export function dispatcherSubject() {
  return new Subject<AppAction>();
}

export const appStateAndDispatcherProvider = [
  {
    provide: initState,
    useFactory: initAppState
  },
  {
    provide: appDispatcher,
    useFactory: dispatcherSubject
  },
  {
    provide: appState,
    useFactory: stateFn,
    deps: [initState, appDispatcher]
  }
];
