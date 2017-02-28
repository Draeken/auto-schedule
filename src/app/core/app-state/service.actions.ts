import { Observable } from 'rxjs';

import { AgentInfo }                        from '../../board/gears/service';
import { AppAction, ActivateServicesAction } from './actions';

export function serviceHandler(initState: AgentInfo[], actions: Observable<AppAction>): Observable<AgentInfo[]> {
  return <Observable<AgentInfo[]>>actions.scan((state: AgentInfo[], action: AppAction) => {
    if (action instanceof ActivateServicesAction) {
      return activateServices(state, action);
    } else {
      return state;
    }
  }, initState);
}


function activateServices(state: AgentInfo[], action: ActivateServicesAction): AgentInfo[] {
  return [...state, ...action.services];
}
