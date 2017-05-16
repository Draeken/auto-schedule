import { AgentInfo } from '../../board/agents/agent-info.interface';

import { LoginStatus } from './user-states.interface';

export class UpdateAgentsAction {
  constructor(public enabled: AgentInfo[], public disabled: string[]) {}
}

export class UpdateLoginStatusAction {
  constructor(public status: LoginStatus) {}
}

export type AppAction =
  UpdateAgentsAction
  | UpdateLoginStatusAction;
