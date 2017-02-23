import { Observable, BehaviorSubject } from 'rxjs';

import { serviceHandler }   from './service.actions';
import { userHandler }      from './user.actions';
import { timelineHandler }  from './timeline.actions';
import { AppState }         from '../shared/app-state.interface';
import { action }           from '../shared/actions';

export function stateFn(initState: AppState, actions: Observable<action>): Observable<AppState> {
  const combines = (s: any) => {
    let appState: AppState = {
      services: s[0],
      userStates: s[1],
      timeline: s[2],
    };
    return appState;
  };
  const appStateObs: Observable<AppState> =
    serviceHandler(initState.services, actions)
      .zip(
        userHandler(initState.userStates, actions),
        timelineHandler(initState.timeline, actions)
      )
      .map(combines);

  return wrapIntoBehavior(initState, appStateObs);
}

function wrapIntoBehavior(initState, obs) {
  const res = new BehaviorSubject(initState);
  obs.subscribe(s => res.next(s));
  return res;
}
