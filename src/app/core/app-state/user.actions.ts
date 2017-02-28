import { Observable } from 'rxjs';

import { UserStates }               from './user-states.interface';
import { AppAction,
         UpdateLoginStatusAction }  from './actions';

export function userHandler(initState: UserStates, actions: Observable<AppAction>): Observable<UserStates> {
  return <Observable<UserStates>>actions.scan((state: UserStates, action: AppAction) => {
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
