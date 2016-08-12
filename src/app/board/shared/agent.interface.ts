import { Observable, Subject } from 'rxjs';

import { Activity, Service } from './';

export interface Agent {
  service: Service;
  getProposals(): Activity[];
  setConductorRegistration(allocation: Observable<any>,
                           requests: Subject<any>): void;
}
