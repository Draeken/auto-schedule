import { Observable } from 'rxjs';

import { Service }                        from '../board/gears/service';
import { action, ActivateServicesAction } from '../shared/actions';

export function serviceHandler(initState: Service[], actions: Observable<action>): Observable<Service[]> {
  return <Observable<Service[]>>actions.scan((state: Service[], action: action) => {
    if (action instanceof ActivateServicesAction) {
      return activateServices(state, action);
    } else {
      return state;
    }
  }, initState);
}


function activateServices(state: Service[], action: ActivateServicesAction): Service[] {
  return [...state, ...action.services];
}
