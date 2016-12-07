import { Observable } from 'rxjs';

import { Agent }              from './agent.abstract';
import { Marker }             from '../gears/activities.class';
import { Service, LOCAL_URL } from '../gears/service';
import { Task }               from '../gears/task.interface';
import { TimeHelper }         from '../gears/time.helper';
import { AppState }           from '../../shared/app-state.interface';

export class FreeAgent extends Agent {
  private readonly name: string;

  constructor() {
    const name = 'free';
    super(name);
    this.name = name;
    this.config.startWith({});
  }

  get service() {
    const service: Service = {
      url: LOCAL_URL,
      name: this.name
    };
    return service;
  }

  endTask(task: Task) {
    // todo: save task
    this.requests.next([{
      id: 0,
      minimalDuration: 1000
    }]);
  }

   getInfo(taskId: number): string {
     switch (taskId) {
       case 0:
        return 'Vous êtes libre';
     }
   }

  protected checkAllocation(context: [any, Marker[]]): void {
    const markers = context[1];
    if (true) {
      this.requests.next([{
        id: 0,
        minimalDuration: 1000
      }]);
    }
  }
}
