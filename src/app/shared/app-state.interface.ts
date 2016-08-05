import { localforage } from 'localforage';

import { Activity, Service } from '../board/shared/';
import { UserStates } from './user-states.interface';

const INIT_USER_STATE: UserStates = {

};

const INIT_APP_STATE: AppState = {
  activities: [],
  userStates: INIT_USER_STATE,
  services: []
};

export function initAppState(): AppState {
  let appState: AppState = INIT_APP_STATE;
  localforage.getItem('appState', (value: AppState) => {
    if (value) {
      appState = value;
    }
  });
  return appState;
}

export interface AppState {
  activities: Activity[];
  userStates: UserStates;
  services: Service[];
}
