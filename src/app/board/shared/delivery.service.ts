import { Injectable, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { DISPATCHER, STATE, action, AppState, ActivateServicesAction } from '../../shared';
import { FreeAgent, SleepAgent, Agent, LOCAL_URL, Service, distinctServices } from './index';

@Injectable()
export class DeliveryService {
  static BASE_SERVICES = [
    'sleep', 'free'
  ];
  private agents = new Map<string, Agent>();

  constructor(@Inject(DISPATCHER) private dispatcher: Observer<action>,
              @Inject(STATE) private state: Observable<AppState>) {
    DeliveryService.BASE_SERVICES.forEach(service =>
      this.agents.set(service, this.getAgentInstance(service)));
    this.state
      .pluck('services')
      .distinctUntilChanged(distinctServices)
      .subscribe((services: Service[]) => {
        this.updateAgentMapping(services);
        this.activateBaseService(services);
      });
  }

  getAgent(agentName: string): Agent {
    return this.agents.get(agentName);
  }

  private getAgentInstance(agentName: string): Agent {
    switch (agentName) {
      case 'sleep':
        return new SleepAgent(this.state);
      case 'free':
        return new FreeAgent(this.state);
    }
  }

  private updateAgentMapping(services: Service[]): void {
    services.forEach(asService => {
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

  private activateBaseService(services: Service[]): void {
    const baseServices = DeliveryService.BASE_SERVICES
    .filter(baseService => !services.find(curService =>
        curService.name === baseService))
    .map(s => ({ name: s, url: LOCAL_URL }));
    baseServices.forEach(s => this.agents.set(s.name, this.getAgentInstance(s.name)));
    this.dispatcher.next(new ActivateServicesAction(baseServices, this.getAgent));
  }
}
