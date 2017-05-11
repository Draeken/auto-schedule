import { AgentInfo } from '../../board/agents/agent-info.interface';

import { LoginStatus } from './user-states.interface';

export class ActivateAgentsAction {
  constructor(public services: AgentInfo[]) {}
}

export class UpdateLoginStatusAction {
  constructor(public status: LoginStatus) {}
}

export type AppAction =
  ActivateAgentsAction
  | UpdateLoginStatusAction;
