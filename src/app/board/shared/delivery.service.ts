import { Injectable, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { SleepAgent, Agent, LOCAL_URL } from './';
import { DISPATCHER, STATE, action, AppState, ActivateServicesAction } from '../../shared';

@Injectable()
export class DeliveryService {
  static BASE_SERVICES = [
    'sleep'
  ];
  private agents: Map<string, Agent>;

  constructor(@Inject(DISPATCHER) private dispatcher: Observer<action>,
              @Inject(STATE) private state: Observable<AppState>) {
    DeliveryService.BASE_SERVICES.forEach(service =>
      this.agents.set(service, this.getAgentInstance(service)));
    this.state.map(curState => {
      this.updateAgentMapping(curState);
      this.activateBaseService(curState);
    });
  }

  getAgent(agentName: string): Agent {
    return this.agents.get(agentName);
  }

  private getAgentInstance(agentName: string): Agent {
    switch (agentName) {
      case 'sleep':
        return new SleepAgent(this.state);
    }
  }

  private updateAgentMapping(appState: AppState): void {
    appState.services.forEach(asService => {
      const sName = asService.name;
      if (this.agents.has(sName) &&
        this.agents.get(sName).service.url === asService.url) {
          return;
      }
      if (asService.url === LOCAL_URL) {
        this.agents.set(sName, this.getAgentInstance(sName));
      } else {
        /* TODO: Wrapper for external agent */
      }
    });
  }

  private activateBaseService(appState: AppState): void {
    const services = DeliveryService.BASE_SERVICES
    .filter(baseService => !appState.services.find(curService =>
        curService.name === baseService))
    .map(s => ({ name: s, url: LOCAL_URL }));
    services.forEach(s => this.agents.set(s.name, this.getAgentInstance(s.name)));
    this.dispatcher.next(new ActivateServicesAction(services, this.getAgent));
  }
}
