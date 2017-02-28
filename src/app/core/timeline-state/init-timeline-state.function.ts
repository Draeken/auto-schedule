import { TimelineState }       from './timeline-state.interface';

const initTimelineStateValue: TimelineState = {
  timeline: []
};

export function initTimelineState(): TimelineState {
  let timelineState: TimelineState = initTimelineStateValue;
  return timelineState;
};
