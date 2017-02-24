import { Observable } from 'rxjs';

import { Agent }  from './agent.abstract';
import { Marker,
         Activities } from '../gears/activities.class';
import { Task }   from '../gears/task.interface';
import { Service} from '../gears/service';

export class AgentOnline extends Agent {

  constructor(service: Service, timeline: Observable<Task[]>) {
    super(service, timeline);
  }

  getInfo(taskId: number): string {
    return "test";
  }

  setTimeline(timeline: Observable<Activities>): void {}

  askForRequest(): void {}

  protected endTask(task: Task): void {}
}
