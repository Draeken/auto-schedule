import { Activity, Service } from '../board/shared/';
import { UserStates } from './user-states.interface';

const INIT_USER_STATE: UserStates = {

};

export const INIT_APP_STATE: AppState = {
  activities: [],
  userStates: INIT_USER_STATE,
  services: []
};

export function initAppState(): AppState {
  let appState: AppState = INIT_APP_STATE;
  //TODO: localforage -> init map -> action
  return appState;
}

export interface AppState {
  activities: Activity[];
  userStates: UserStates;
  services: Service[];
}
