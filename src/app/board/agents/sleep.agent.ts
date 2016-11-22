import { Observable } from 'rxjs';

import { Agent }              from './agent.abstract';
import { Marker }             from '../gears/activities.class';
import { Service, LOCAL_URL } from '../gears/service';
import { Task }               from '../gears/task.interface';
import { TimeHelper }         from '../gears/time.helper';
import { AppState }           from '../../shared/app-state.interface';

export class SleepAgent extends Agent {

  constructor(private appState: Observable<AppState>) {
    super();
    this.config.startWith({});
  }

  get service() {
    const service: Service = {
      url: LOCAL_URL,
      name: 'sleep'
    };
    return service;
  }

  endTask(task: Task) {
    //todo: save task
  }

  getInfo(taskId: number): string {
    switch (taskId) {
      case 0:
        return 'Se préparer à dodosh';
      case 1:
        return 'Pas d\'écran bleu !';
    }
  }

  protected checkAllocation(context: [any, Marker[]]): void {
    const markers = context[1];
    if (true) {
      this.requests.next([{
        id: 1,
        start: TimeHelper.relativeTime(0, 0.1),
        duration: TimeHelper.duration(5),
        minimalDuration: TimeHelper.duration(1)
      }, {
        id: 0,
        start: TimeHelper.relativeTime(0, 0.2),
        duration: TimeHelper.duration(5),
        minimalDuration: TimeHelper.duration(1)
      }]);
    }
  }
}
