import { Observable, BehaviorSubject } from 'rxjs';

import { serviceHandler } from './service.actions';
import { AppState }       from '../shared/app-state.interface';
import { action }         from '../shared/actions';

/* TODO: handle ActivateServicesAction */

export function stateFn(initState: AppState, actions: Observable<action>): Observable<AppState> {
  const combines = (s: any) => {
    let appState: AppState = {
      userStates: null,
      services: s
    };
    return appState;
  };
  const appStateObs: Observable<AppState> =
    serviceHandler(initState.services, actions).
    map(combines);

  return wrapIntoBehavior(initState, appStateObs);
}

function wrapIntoBehavior(initState, obs) {
  const res = new BehaviorSubject(initState);
  obs.subscribe(s => res.next(s));
  return res;
}
