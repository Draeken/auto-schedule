import { Injectable, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { SleepAgent, Agent } from './';
import { DISPATCHER, STATE, action, AppState, ActivateServicesAction } from '../../shared';

@Injectable()
export class DeliveryService {
  static BASE_SERVICES = [
    'sleep'
  ];
  agents: Map<string, Agent>;

  constructor(
    @Inject(DISPATCHER) private dispatcher: Observer<action>,
    @Inject(STATE) private state: Observable<AppState>) {
      this.state.map(curState => this.activateBaseService(curState));
    }

    private activateBaseService(appState: AppState): void {
      const services = DeliveryService.BASE_SERVICES.filter(baseService =>
        !appState.services.find(curService =>
          curService.name === baseService)).map(s => ({ name: s, url: 'localhost' }));
      this.dispatcher.next(new ActivateServicesAction(services));
    }
}
