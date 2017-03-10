import { Observable } from 'rxjs';

import { Agent }  from './agent.abstract';
import { Marker,
         Activities } from '../gears/activities.class';
import { Task }   from '../gears/task.interface';
import { AgentInfo} from './agent-info.interface';

export class AgentOnline extends Agent {

  constructor(service: AgentInfo, timeline: Observable<Task[]>) {
    super(service, timeline);
  }

  getInfo(taskId: number): string {
    return "test";
  }

  askForRequest(): void {}

  protected endTask(task: Task): void {}

  protected requestFeedback(timeline: Marker[]): void {
    console.log(this.service.name, timeline);
  }
}
