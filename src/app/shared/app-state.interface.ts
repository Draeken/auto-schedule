import * as LocalForage from 'localforage';

import { Activity } from '../board/shared/activity.interface';
import { UserStates } from './user-states.interface';

const INIT_USER_STATE: UserStates = {

};

const INIT_APP_STATE: AppState = {
  activities: [],
  userStates: INIT_USER_STATE
};

export function initAppState(): AppState {
  return null;
}

export interface AppState {
  activities: Activity[];
  userStates: UserStates;
}
