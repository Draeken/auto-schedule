import { Service }    from '../board/gears/service';
import { UserStates } from './user-states.interface';

export interface AppState {
  userStates: UserStates;
  services: Service[];
}
