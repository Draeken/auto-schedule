import { Observable, Subject } from 'rxjs';

import { Marker,
         Activities }   from '../gears/activities.class';
import { Service }      from '../gears/service';
import { ServiceQuery } from '../gears/service-query.interface';
import { Task }         from '../gears/task.interface';
import { Occurence }    from './occurence.interface';

export abstract class Agent {
  protected requests: Subject<ServiceQuery[]>;

  constructor(private _service: Service) {
  }

  abstract setTimeline(timeline: Observable<Activities>): void

  abstract getInfo(taskId: number): string

  abstract endTask(task: Task): void

  abstract askForRequest(): void

  get service() {
    return Object.assign({}, this._service);
  }

  setRequests(requests: Subject<ServiceQuery[]>): void {
    this.requests = requests;
  }

}
