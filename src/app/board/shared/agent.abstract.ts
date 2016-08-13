import { Observable, Subject } from 'rxjs';

import { Activity, Service } from './';

export abstract class Agent {
  service: Service;
  protected config = new Subject<any>();
  protected requests: Subject<any>;

  setComponentRegistration(obs: Observable<any>): void {
    obs.subscribe(this.config);
  }

  setConductorRegistration(allocation: Observable<any>,
                           requests: Subject<any>): void {
    this.requests = requests;
    this.config.combineLatest(allocation).subscribe(this.checkAllocation);
  }

  protected abstract checkAllocation(context: [any, any]): void
}
