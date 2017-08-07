import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/scan';

import { AgentInfo } from '../../board/agents/agent-info.interface';
import { AppAction, UpdateAgentsAction } from './actions';

export function agentHandler(initState: AgentInfo[], actions: Observable<AppAction>): Observable<AgentInfo[]> {
  return <Observable<AgentInfo[]>>actions.scan((state: AgentInfo[], action: AppAction) => {
    if (action instanceof UpdateAgentsAction) {
      return updateAgents(state, action);
    } else {
      return state;
    }
  }, initState);
}


function updateAgents(state: AgentInfo[], action: UpdateAgentsAction): AgentInfo[] {
  const agents = state.filter(ai => action.disabled.find(d => ai.name === d) === undefined);
  agents.push(...action.enabled);
  return agents;
}
