import { Observable } from 'rxjs';

import { Activity, Agent, Service, TimeHelper, LOCAL_URL } from './';

export class SleepAgent implements Agent {
  private allocations: Observable<any>;

  constructor() {
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
}
