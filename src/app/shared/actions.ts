import { Service }  from '../board/gears/service';

import { LoginStatus }  from './user-states.interface';
import { TaskStatus }   from '../board/gears/task.interface';
import { Activities }   from '../board/gears/activities.class';

export class ActivateServicesAction {
  constructor(public services: Service[]) {}
}

export class UpdateLoginStatusAction {
  constructor(public status: LoginStatus) {}
}

export class UpdateTaskStatusAction {
  constructor(public serviceName: string, public taskId: number, public newStatus: TaskStatus) {}
}

export class UpdateTimelineAction {
  constructor(public timeline: Activities) {}
}

export type action =
  ActivateServicesAction
  | UpdateLoginStatusAction
  | UpdateTaskStatusAction
  | UpdateTimelineAction;
