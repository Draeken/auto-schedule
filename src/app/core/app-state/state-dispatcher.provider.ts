import { InjectionToken } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { initAppState } from './init-app-state.function';
import { stateFn } from './app-state.function';
import { AppAction } from './actions';
import { AppState } from './app-state.interface';

export const initState = new InjectionToken<AppState>('init.app.state');
export const appDispatcher = new InjectionToken<Subject<AppAction>>('app.dispatcher');
export const appState = new InjectionToken<Observable<AppState>>('app.state');

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
