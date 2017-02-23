import { Observable } from 'rxjs';

import { UserStates }               from '../shared/user-states.interface';
import { action,
         UpdateLoginStatusAction }  from '../shared/actions';

export function userHandler(initState: UserStates, actions: Observable<action>): Observable<UserStates> {
  return <Observable<UserStates>>actions.scan((state: UserStates, action: action) => {
    if (action instanceof UpdateLoginStatusAction) {
      return changeLoginStatus(state, action);
    } else {
      return state;
    }
  }, initState);
}


function changeLoginStatus(state: UserStates, action: UpdateLoginStatusAction): UserStates {
  let newState: UserStates = Object.assign({}, state);
  newState.loggedStatus = action.status;
  return newState;
}
