import { Observable, Subject } from 'rxjs';

import { Marker, Service, ServiceQuery, Task } from './';

export abstract class Agent {
  service: Service;
  protected config = new Subject<any>();
  protected requests: Subject<ServiceQuery[]>;

  constructor() { }

  setComponentRegistration(obs: Observable<any>): void {
    obs.subscribe(this.config);
  }

  setConductorRegistration(allocation: Observable<Marker[]>,
                           requests: Subject<ServiceQuery[]>): void {
    this.requests = requests;
    this.config.combineLatest(allocation).subscribe(this.checkAllocation);
  }

  abstract endTask(task: Task): void

  protected abstract checkAllocation(context: [any, Marker[]]): void
}
