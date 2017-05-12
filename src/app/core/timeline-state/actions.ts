import { TaskStatus, Task } from '../../board/gears/task.interface';

export class UpdateTaskStatusAction {
  constructor(public task: Task, public newStatus: TaskStatus) {}
}

export class UpdateTimelineAction {
  constructor(public timeline: Task[]) {}
}

export type TimelineAction =
  UpdateTaskStatusAction
  | UpdateTimelineAction;
