import { Observable, Subject } from 'rxjs';

import { Activity, Activities, Service, ServiceQuery } from './';

export abstract class Agent {
  service: Service;
  protected config = new Subject<any>();
  protected requests: Subject<ServiceQuery[]>;

  setComponentRegistration(obs: Observable<any>): void {
    obs.subscribe(this.config);
  }

  setConductorRegistration(allocation: Observable<Activities>,
                           requests: Subject<ServiceQuery[]>): void {
    this.requests = requests;
    this.config.combineLatest(allocation).subscribe(this.checkAllocation);
  }

  protected abstract checkAllocation(context: [any, Activities]): void
}
