import { AgentInfo }    from '../../board/gears/service';

import { UserStates } from './user-states.interface';

export interface AppState {
  userStates: UserStates;
  agents: AgentInfo[];
}
