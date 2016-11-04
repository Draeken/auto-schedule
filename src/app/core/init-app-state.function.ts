import { UserStates } from '../shared/user-states.interface';
import { AppState }   from '../shared/app-state.interface';

const initUserState: UserStates = {
};

const initAppStateValue: AppState = {
  userStates: initUserState,
  services: []
};

export function initAppState(): AppState {
  let appState: AppState = initAppStateValue;
  // TODO: localforage -> init map -> action
  return appState;
};
