import { AgentInfo } from '../../board/agents/agent-info.interface';

import { UserStates } from './user-states.interface';

export interface AppState {
  userStates: UserStates;
  agents: AgentInfo[];
}
