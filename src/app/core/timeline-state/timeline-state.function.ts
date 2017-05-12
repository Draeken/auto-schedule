import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { timelineHandler } from './timeline.actions';
import { TimelineState } from './timeline-state.interface';
import { TimelineAction } from './actions';

export function stateFn(initState: TimelineState, actions: Observable<TimelineAction>): Observable<TimelineState> {
  const combines = (s: any) => {
    const appState: TimelineState = {
      timeline: s
    };
    return appState;
  };
  const appStateObs: Observable<TimelineState> =
    timelineHandler(initState.timeline, actions).map(combines);

  return wrapIntoBehavior(initState, appStateObs);
}

function wrapIntoBehavior(initState, obs) {
  const res = new BehaviorSubject(initState);
  obs.subscribe(s => res.next(s));
  res.subscribe(v => console.info('BS', v), v => console.error('error:', v));
  /* Le problème vient du res.next(s) : quelque chose observe est fuck le système */
  return res;
}
