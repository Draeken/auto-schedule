import { UserStates,
         LoginStatus } from './user-states.interface';
import { AppState } from './app-state.interface';
import { LocalUserInfo } from '../../shared/local-user-info.interface';

import { AgentInfo } from '../../board/agents/agent-info.interface';

function getInitialUserState(): UserStates {
  const initUserState: UserStates = {
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

function getInitialServices(): AgentInfo[] {
  return [
    {
      name: 'Custom Task',
      url: 'http://localhost:3001/api',
      agentPermission: null,
      userPermission: null
    },
  ];
}

const initAppStateValue: AppState = {
  userStates: getInitialUserState(),
  agents: getInitialServices()
};

export function initAppState(): AppState {
  const appState: AppState = initAppStateValue;
  return appState;
};
