import { AgentInfo }  from '../../board/gears/service';

import { LoginStatus }  from './user-states.interface';

export class ActivateServicesAction {
  constructor(public services: AgentInfo[]) {}
}

export class UpdateLoginStatusAction {
  constructor(public status: LoginStatus) {}
}

export type AppAction =
  ActivateServicesAction
  | UpdateLoginStatusAction;
