import { Service }    from '../board/gears/service';
import { Task }       from '../board/gears/task.interface'

import { UserStates } from './user-states.interface';

export interface AppState {
  userStates: UserStates;
  services: Service[];
  timeline: Task[];
}
