import { Observable } from 'rxjs';

import { Activity }                                           from '../board/gears/activity.interface';
import { action, AddActivityAction, ActivateServicesAction }  from '../shared/actions';

export function activityHandler(initState: Activity[], actions: Observable<action>): Observable<Activity[]> {
  return <Observable<Activity[]>>actions.scan((state: Activity[], action: action) => {
    if (action instanceof AddActivityAction) {
      return addActivity(state, action);
    } else if (action instanceof ActivateServicesAction) {
      return activateServices(state, action);
    } else {
      return state;
    }
  }, initState);
}

function addActivity(state: Activity[], action: AddActivityAction): Activity[] {
  return state;
}

function activateServices(state: Activity[], action: ActivateServicesAction): Activity[] {
  const newActivities = action.services
  .map(s => action.getAgent(s.name))
  .map(a => [])
  .reduce((a, b) => a.concat(b));

  return state.concat(newActivities);
}
