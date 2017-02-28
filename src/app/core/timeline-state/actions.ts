import { TaskStatus }   from '../../board/gears/task.interface';
import { Activities }   from '../../board/gears/activities.class';

export class UpdateTaskStatusAction {
  constructor(public serviceName: string, public taskId: number, public newStatus: TaskStatus) {}
}

export class UpdateTimelineAction {
  constructor(public timeline: Activities) {}
}

export type TimelineAction =
  UpdateTaskStatusAction
  | UpdateTimelineAction;
