import { Observable } from 'rxjs';

import { TaskStatus, Task }   from '../board/gears/task.interface';
import { Activities }   from '../board/gears/activities.class';

import { action,
         UpdateTimelineAction,
         UpdateTaskStatusAction } from '../shared/actions';

export function timelineHandler(initState: Task[], actions: Observable<action>): Observable<Task[]> {
  return <Observable<Task[]>>actions.scan((tasks: Task[], action: action) => {
    if (action instanceof UpdateTimelineAction) {
      return updateTimeline(tasks, action);
    } else {
      return tasks;
    }
  }, initState);
}


function updateTimeline(tasks: Task[], action: UpdateTimelineAction): Task[] {
  return action.timeline.toArray();
}
