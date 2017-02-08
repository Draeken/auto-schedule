import { Agent }    from '../board/agents/agent.abstract';
import { Service }  from '../board/gears/service';

import { LoginStatus }  from './user-states.interface';

export class AddActivityAction {
  constructor(public name: string) {}
}

export type strToAgent = (n: string) => Agent;

export class ActivateServicesAction {
  constructor(public services: Service[]) {}
}

export class ChangeLoginStatusAction {
  constructor(public status: LoginStatus) {}
}

export type action =
    AddActivityAction
  | ActivateServicesAction
  | ChangeLoginStatusAction;
