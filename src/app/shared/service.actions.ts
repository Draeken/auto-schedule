import { Observable } from 'rxjs';

import { Service } from '../board/shared/';
import { action, ActivateServicesAction } from './actions';

export function serviceHandler(initState: Service[], actions: Observable<action>): Observable<Service[]> {
  return actions.scan((state, action) => {
    if (action instanceof ActivateServicesAction) {
      return activateServices(state, action);
    } else {
      return state;
    }
  }, initState);
}


function activateServices(state: Service[], action: ActivateServicesAction): Service[] {
  return state.concat(action.services);
}
