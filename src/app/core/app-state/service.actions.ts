import { Observable } from 'rxjs';

import { AgentInfo }                        from '../../board/agents/agent-info.interface';
import { AppAction, ActivateAgentsAction } from './actions';

export function agentHandler(initState: AgentInfo[], actions: Observable<AppAction>): Observable<AgentInfo[]> {
  return <Observable<AgentInfo[]>>actions.scan((state: AgentInfo[], action: AppAction) => {
    if (action instanceof ActivateAgentsAction) {
      return activateAgents(state, action);
    } else {
      return state;
    }
  }, initState);
}


function activateAgents(state: AgentInfo[], action: ActivateAgentsAction): AgentInfo[] {
  return [...state, ...action.services];
}
