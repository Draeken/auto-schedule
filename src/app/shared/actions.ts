import { Observable, BehaviorSubject } from 'rxjs';

import { AppState } from './app-state.interface'
import { activityHandler } from './activity.actions'

export class AddActivityAction {
  constructor(public name: string) {}
}

export type action = AddActivityAction;

export function stateFn(initState: AppState, actions: Observable<action>): Observable<AppState> {
  const combine = s => ({
    activities: s[0],
    userStates: null
  });
  const appStateObs: Observable<AppState> =
    activityHandler(initState.activities, actions).
    zip().
    map(combine);
  return wrapIntoBehavior(initState, appStateObs);
}

function wrapIntoBehavior(initState, obs) {
  const res = new BehaviorSubject(initState);
  obs.subscribe(s => res.next(s));
  return res;
}
