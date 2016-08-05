import { Service } from '../board/shared';

export class AddActivityAction {
  constructor(public name: string) {}
}

export class ActivateServicesAction {
  constructor(public service: Service[]) {}
}

export type action = AddActivityAction | ActivateServicesAction;
