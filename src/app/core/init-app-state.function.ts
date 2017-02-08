import { UserStates,
         LoginStatus }    from '../shared/user-states.interface';
import { AppState }       from '../shared/app-state.interface';
import { LocalUserInfo }  from '../shared/local-user-info.interface';

function getInitialUserState(): UserStates {
  let initUserState: UserStates = {
    loggedStatus: LoginStatus.notLogged
  };
  const user: LocalUserInfo = JSON.parse(localStorage.getItem('user'));
  if (user) {
    if (user.email) {
      initUserState.loggedStatus = LoginStatus.fullyLogged;
    } else {
      initUserState.loggedStatus = LoginStatus.partialLogged;
    }
  }
  return initUserState;
}

const initAppStateValue: AppState = {
  userStates: getInitialUserState(),
  services: []
};

export function initAppState(): AppState {
  let appState: AppState = initAppStateValue;
  return appState;
};
