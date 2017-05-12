import { InjectionToken } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { initTimelineState } from './init-timeline-state.function';
import { stateFn } from './timeline-state.function';
import { TimelineAction } from './actions';
import { TimelineState } from './timeline-state.interface';

export const initState = new InjectionToken<TimelineState>('init.timeline.state');
export const timelineDispatcher = new InjectionToken<Subject<TimelineAction>>('timeline.dispatcher');
export const timelineState = new InjectionToken<Observable<TimelineState>>('timeline.state');

export function dispatcherSubject() {
  const s = new Subject<TimelineAction>();
  return s;
}

export const timelineStateAndDispatcherProvider = [
  {
    provide: initState,
    useFactory: initTimelineState
  },
  {
    provide: timelineDispatcher,
    useFactory: dispatcherSubject
  },
  {
    provide: timelineState,
    useFactory: stateFn,
    deps: [initState, timelineDispatcher]
  }
];
