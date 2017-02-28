import { Observable } from 'rxjs';

import { Service }                        from '../../board/gears/service';
import { AppAction, ActivateServicesAction } from './actions';

export function serviceHandler(initState: Service[], actions: Observable<AppAction>): Observable<Service[]> {
  return <Observable<Service[]>>actions.scan((state: Service[], action: AppAction) => {
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
