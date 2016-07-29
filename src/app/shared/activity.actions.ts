import { Observable } from 'rxjs';

import { Activity } from "../board/shared/activity.interface";
import { action, AddActivityAction } from './actions'

export function activityHandler(initState: Activity[], actions: Observable<action>): Observable<Activity[]> {
  return actions.scan((state, action) => {
    if (action instanceof AddActivityAction) {
      return addActivity(state, action)
    } else {
      return state;
    }
  }, initState);
}

function addActivity(state, action: AddActivityAction): Activity[] {
  return state;
}
