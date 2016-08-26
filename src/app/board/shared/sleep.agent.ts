import { Observable } from 'rxjs';

import { AppState } from '../../shared';
import { Agent, Marker, Service, TimeHelper, LOCAL_URL, Task } from './index';

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

  protected checkAllocation(context: [any, Marker[]]): void {
    const markers = context[1];
    if (true) {
      this.requests.next([{
        id: 0,
        start: TimeHelper.nextTime(22, 42),
        duration: TimeHelper.duration(8),
        minimalDuration: TimeHelper.duration(1)
      }]);
    }
  }
}
