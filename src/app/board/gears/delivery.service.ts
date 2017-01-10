import { Injectable, Inject }   from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { action, ActivateServicesAction } from '../../shared/actions';
import { AppState }                       from '../../shared/app-state.interface';
import { dispatcher, state }              from '../../core/state-dispatcher.provider';
import { Agent }                          from '../agents/agent.abstract';
import { AgentOnline }                    from '../agents/agent-online.class';
import { Service, distinctServices }      from './service';

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
  private agentMap = new Map<string, Agent>();

  private services: Observable<{}>;

  constructor(@Inject(dispatcher) private dispatcher: Observer<action>,
              @Inject(state) private state: Observable<AppState>) {
    // DeliveryService.BASE_SERVICES.forEach(service =>
    //   this.agentMap.set(service, this.getAgentInstance(service)));
    this.services = this.state.pluck('services').distinctUntilChanged(distinctServices);
    this.services.subscribe((services: Service[]) => {
      this.updateAgentMapping(services);
      this.activateBaseService(services);
    });
  }

  get agents(): Observable<Agent[]> {
    return this.services.map((services: Service[]) => services.map(s => this.getAgent(s.name)));
  }

  getAgent(agentName: string): Agent {
    return this.agentMap.get(agentName);
  }

  private updateAgentMapping(services: Service[]): void {
    services.forEach(asService => {
      const sName = asService.name;
      if (this.agentMap.has(sName) &&
        this.agentMap.get(sName).service.url === asService.url) {
          return;
      }
      this.agentMap.set(sName, new AgentOnline(sName, asService.url));
    });
  }

  private activateBaseService(services: Service[]): void {
    const baseServices = DeliveryService.BASE_SERVICES
    .filter(baseService => !services.find(curService =>
        curService.name === baseService))
    .map(s => ({ name: s, url: 'localhost' })); // Set real url of base services
    baseServices.forEach(s => this.agentMap.set(s.name, new AgentOnline(s.name, s.url)));
    this.dispatcher.next(new ActivateServicesAction(baseServices));
  }
}
