import { Observable, Subject } from 'rxjs';

import { Marker }       from '../gears/activities.class';
import { Service }      from '../gears/service';
import { ServiceQuery } from '../gears/service-query.interface';
import { Task }         from '../gears/task.interface';

export abstract class Agent {
  service: Service;
  protected config: Subject<any>;
  protected requests: Subject<ServiceQuery[]>;

  constructor() {
    this.config = new Subject<any>();
  }

  setComponentRegistration(obs: Observable<any>): void {
    obs.subscribe(this.config);
  }

  setConductorRegistration(allocation: Observable<Marker[]>,
                           requests: Subject<ServiceQuery[]>): void {
    this.requests = requests;
    this.config.combineLatest(allocation).subscribe(this.checkAllocation);
    this.checkAllocation([null, []]);
  }

  abstract getInfo(taskId: number): string

  abstract endTask(task: Task): void

  protected abstract checkAllocation(context: [any, Marker[]]): void
}
