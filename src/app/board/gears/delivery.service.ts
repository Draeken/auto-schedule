import { Injectable, Inject }   from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { action, ActivateServicesAction }       from '../../shared/actions';
import { AppState }                             from '../../shared/app-state.interface';
import { dispatcher, state }                    from '../../core/state-dispatcher.provider';
import { Agent }                                from '../agents/agent.abstract';
import { SleepAgent, FreeAgent, TestAgent }     from '../agents/agents';
import { LOCAL_URL, Service, distinctServices } from './service';

@Injectable()
export class DeliveryService {

  /**
   * These services are loaded automatically
   */
  static BASE_SERVICES = [
    'sleep'
  ];

  /**
   * Map<ServiceName, Agent>
   */
  private agents = new Map<string, Agent>();

  constructor(@Inject(dispatcher) private dispatcher: Observer<action>,
              @Inject(state) private state: Observable<AppState>) {
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
        return new SleepAgent();
      case 'free':
        return new FreeAgent();
      case 'test':
        return new TestAgent();
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
