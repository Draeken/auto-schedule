import { Observable } from 'rxjs';

import { Agent }  from './agent.abstract';
import { Marker,
         Activities } from '../gears/activities.class';
import { Task }   from '../gears/task.interface';
import { Service} from '../gears/service';

export class AgentOnline extends Agent {

  constructor(service: Service) {
    super(service);
  }

  getInfo(taskId: number): string {
    return "test";
  }

  endTask(task: Task): void {}


  setTimeline(timeline: Observable<Activities>): void {}

  askForRequest(): void {}
}
