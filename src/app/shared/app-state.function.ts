import { Observable, BehaviorSubject } from 'rxjs';
import { AppState, action, activityHandler, serviceHandler } from './index';

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
