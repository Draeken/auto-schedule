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

  private services: Observable<{}>;

  constructor(@Inject(dispatcher) private dispatcher: Observer<action>,
              @Inject(state) private state: Observable<AppState>) {
    this.services = this.state.pluck('services').distinctUntilChanged(distinctServices);
  }

  get agents(): Observable<Agent[]> {
    return this.services.map((services: Service[]) => services.map(s => new AgentOnline(s, this.state.pluck('timeline'))));
  }
}
