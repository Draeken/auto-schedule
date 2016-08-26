import { Observable, BehaviorSubject } from 'rxjs';
import { AppState, action, activityHandler, serviceHandler } from './';

export function stateFn(initState: AppState, actions: Observable<action>): Observable<AppState> {
  const combine = s => ({
    activities: s[0],
    userStates: null,
    services: null
  });
  const appStateObs: Observable<AppState> =
    activityHandler(null, actions).
    zip(serviceHandler(initState.services, actions)).
    map(combine);

  return wrapIntoBehavior(initState, appStateObs);
}

function wrapIntoBehavior(initState, obs) {
  const res = new BehaviorSubject(initState);
  obs.subscribe(s => res.next(s));
  return res;
}
