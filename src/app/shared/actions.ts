import { Agent }    from '../board/agents/agent.abstract';
import { Service }  from '../board/gears/service';

export class AddActivityAction {
  constructor(public name: string) {}
}

export type strToAgent = (n: string) => Agent;

export class ActivateServicesAction {
  constructor(public services: Service[]) {}
}

export type action = AddActivityAction | ActivateServicesAction;
