import { Activity } from "../board/shared/activity.interface";
import { UserStates } from "./user-states.interface";

const INIT_USER_STATE: UserStates = {

};

export const INIT_APP_STATE: AppState = {
  activities: [],
  userStates: INIT_USER_STATE
};

export interface AppState {
  activities: Activity[];
  userStates: UserStates;
}
