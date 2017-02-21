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
   * Map<ServiceName, Agent>
   */
  private agentMap = new Map<string, Agent>();

  private services: Observable<{}>;

  constructor(@Inject(dispatcher) private dispatcher: Observer<action>,
              @Inject(state) private state: Observable<AppState>) {
    this.services = this.state.pluck('services').distinctUntilChanged(distinctServices);
    this.services.subscribe((services: Service[]) => {
      this.updateAgentMapping(services);
    });
  }

  get agentsFromMap(): Observable<Agent[]> {
    return this.services.map((services: Service[]) => services.map(s => this.getAgent(s.name)));
  }

  get agents(): Observable<Agent[]> {
    return this.services.map((services: Service[]) => services.map(s => new AgentOnline(s)));
  }

  getAgent(agentName: string): Agent {
    return this.agentMap.get(agentName);
  }

  private updateAgentMapping(services: Service[]): void {
    services.forEach(asService => {
      const sName = asService.name;
      if (this.agentMap.has(sName)) {
        return;
      }
      this.agentMap.set(sName, new AgentOnline(asService));
    });
  }
}
