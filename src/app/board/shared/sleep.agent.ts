import { Observable, Subject } from 'rxjs';

import { AppState } from '../../shared';
import { Activity, Agent, Service, TimeHelper, LOCAL_URL } from './';

export class SleepAgent implements Agent {
  private config = new Subject<any>();
  private requests: Subject<any>;

  constructor(private appState: Observable<AppState>) {
    this.config.startWith({});
  }

  setComponentRegistration(obs: Observable<any>): void {
    obs.subscribe(this.config);
  }

  setConductorRegistration(allocation: Observable<any>,
                           requests: Subject<any>): void {
    this.requests = requests;
    this.config.combineLatest(allocation).subscribe(this.checkAllocation);
  }

  getProposals(): Activity[] {
    const activities: Activity[] = [
      {
        responsible: this.service,
        name: 'Sleep',
        constraints: {
          pattern: { day: 1 },
          length: 8 * 3600,
          when: TimeHelper.fromHours(22, 42)
        }
      }
    ];

    return activities;
  }

  get service() {
    const service: Service = {
      url: LOCAL_URL,
      name: 'sleep'
    };
    return service;
  }

  private checkAllocation(context: [any, any]): void {

  }
}
