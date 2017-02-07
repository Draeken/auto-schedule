import { Agent }  from './agent.abstract';
import { Marker } from '../gears/activities.class';
import { Task }   from '../gears/task.interface';

export class AgentOnline extends Agent {

  constructor(name: string, private url: string) {
    super(name);
  }

  getInfo(taskId: number): string {
    return "test";
  }

  endTask(task: Task): void {}

  protected checkAllocation(context: [any, Marker[]]): void {}
}
