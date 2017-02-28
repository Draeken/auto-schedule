import { UserStates,
         LoginStatus }    from './user-states.interface';
import { AppState }       from './app-state.interface';
import { LocalUserInfo }  from '../../shared/local-user-info.interface';

import { Service }  from '../../board/gears/service';

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

function getInitialServices(): Service[] {
  return [
    {
      name: 'Custom Task',
      url: 'localhost:3001/api'
    },
  ]
}

const initAppStateValue: AppState = {
  userStates: getInitialUserState(),
  services: getInitialServices()
};

export function initAppState(): AppState {
  let appState: AppState = initAppStateValue;
  return appState;
};
