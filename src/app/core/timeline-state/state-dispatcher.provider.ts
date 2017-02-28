import { OpaqueToken }          from '@angular/core';
import { Subject, Observable }  from 'rxjs';

import { initTimelineState } from './init-timeline-state.function';
import { stateFn }      from './timeline-state.function';
import { TimelineAction }       from './actions';
import { TimelineState }     from './timeline-state.interface';

export const initState = new OpaqueToken('init.state');
export const timelineDispatcher = new OpaqueToken('dispatcher');
export const timelineState = new OpaqueToken('state');

export function dispatcherSubject() {
  return new Subject<TimelineAction>();
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
