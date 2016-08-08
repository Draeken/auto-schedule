import { Service, Agent } from '../board/shared';

export class AddActivityAction {
  constructor(public name: string) {}
}

type f = (n: string) => Agent;

export class ActivateServicesAction {
  constructor(public services: Service[], public getAgent: f) {}
}

export type action = AddActivityAction | ActivateServicesAction;
