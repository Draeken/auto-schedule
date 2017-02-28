import { Observable, BehaviorSubject } from 'rxjs';

import { timelineHandler }      from './timeline.actions';
import { TimelineState }         from './timeline-state.interface';
import { TimelineAction }           from './actions';

export function stateFn(initState: TimelineState, actions: Observable<TimelineAction>): Observable<TimelineState> {
  const combines = (s: any) => {
    let appState: TimelineState = {
      timeline: s
    };
    return appState;
  };
  const appStateObs: Observable<TimelineState> =
    timelineHandler(initState.timeline, actions)
      // .zip(
      //   userHandler(initState.userStates, actions)
      // )
      .map(combines);

  return wrapIntoBehavior(initState, appStateObs);
}

function wrapIntoBehavior(initState, obs) {
  const res = new BehaviorSubject(initState);
  obs.subscribe(s => res.next(s));
  return res;
}
