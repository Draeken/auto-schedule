import { Observable } from 'rxjs';

import { Activity } from '../board/shared/activity.interface';
import { action, AddActivityAction, ActivateServicesAction } from './actions';

export function activityHandler(initState: Activity[], actions: Observable<action>): Observable<Activity[]> {
  return actions.scan((state, action) => {
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
  .map(a => a.getProposals())
  .reduce((a, b) => a.concat(b));

  return state.concat(newActivities);
}
