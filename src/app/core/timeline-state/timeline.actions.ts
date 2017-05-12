import { Observable } from 'rxjs/Observable';

import { TaskStatus, Task } from '../../board/gears/task.interface';

import { TimelineAction,
         UpdateTimelineAction,
         UpdateTaskStatusAction } from './actions';

export function timelineHandler(initState: Task[], actions: Observable<TimelineAction>): Observable<Task[]> {
  return <Observable<Task[]>>actions.scan((tasks: Task[], action: TimelineAction) => {
    if (action instanceof UpdateTimelineAction) {
      return updateTimeline(tasks, action);
    } else {
      return tasks;
    }
  }, initState);
}


function updateTimeline(tasks: Task[], action: UpdateTimelineAction): Task[] {
  return [...action.timeline];
}
