import { Observable } from 'rxjs';

import { Agent }              from './agent.abstract';
import { Marker }             from '../gears/activities.class';
import { Service, LOCAL_URL } from '../gears/service';
import { Task }               from '../gears/task.interface';
import { TimeHelper }         from '../gears/time.helper';
import { AppState }           from '../../shared/app-state.interface';

export class TestAgent extends Agent {
  private idCounter = 0;

  constructor(private appState: Observable<AppState>) {
    super();
    this.config.startWith({});
  }

  get service() {
    const service: Service = {
      url: LOCAL_URL,
      name: 'test'
    };
    return service;
  }

  endTask(task: Task) {
    console.log('endTask', task);
    this.idCounter = task.id + 1;
    // todo: save task
    this.requests.next([{
      id: this.idCounter,
      start: TimeHelper.relativeTime(0, 0.1),
      duration: 5000,
      minimalDuration: 1000
    }]);
  }

   getInfo(taskId: number): string {
     return `Test number ${taskId}.`;
   }

  protected checkAllocation(context: [any, Marker[]]): void {
    const markers = context[1];
    console.log('markers', markers);
    if (true) {
      this.requests.next([{
        id: this.idCounter,
        start: TimeHelper.relativeTime(0, 0.1),
        duration: 5000,
        minimalDuration: 1000
      }]);
    }
  }
}
