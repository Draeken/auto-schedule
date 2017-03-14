import { Observable } from 'rxjs';

import { Agent }  from './agent.abstract';
import { Marker,
         Activities } from '../gears/activities.class';
import { Task }   from '../gears/task.interface';
import { AgentInfo} from './agent-info.interface';
import { RequestToAgent } from '../gears/resource-mapper.service';

export class AgentOnline extends Agent {

  constructor(service: AgentInfo) {
    super(service);
  }

  getInfo(taskId: number): string {
    return "test";
  }

  askForRequest(): void {
    console.info('ask for request');
  }

  notifyStateChange(payload: Object): void {
    console.info('notify state change');
  }

  askToProvide(payload: RequestToAgent[]): void {
    console.info('ask to provide', payload);
  }

  protected endTask(task: Task): void {
    console.info('end task', task);
  }

  protected requestFeedback(timeline: Marker[]): void {
    console.log(this.service.name, timeline);
  }
}
