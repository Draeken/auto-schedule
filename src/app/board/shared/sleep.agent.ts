import { Observable, Subject } from 'rxjs';

import { AppState } from '../../shared';
import { Activity, Activities, Agent, Service, ServiceQuery, TimeHelper, LOCAL_URL } from './';

export class SleepAgent extends Agent {

  constructor(private appState: Observable<AppState>) {
    super();
    this.config.startWith({});
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

  protected checkAllocation(context: [any, Activities]): void {
    const activities = context[1];
    if (!activities.fromId(0)) {
      this.requests.next([{
        start: TimeHelper.fromHours(22, 42),
        duration: 8 * 3600
      }]);
    }
  }
}
