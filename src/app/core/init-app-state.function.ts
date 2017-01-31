import { UserStates, LoginStatus } from '../shared/user-states.interface';
import { AppState }   from '../shared/app-state.interface';

function getInitialUserState(): UserStates {
  let initUserState: UserStates = {
    loggedStatus: LoginStatus.notLogged
  };
  const clientToken = localStorage.getItem('token-client');
  if (clientToken) {
    initUserState.loggedStatus = LoginStatus.fullyLogged;
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
