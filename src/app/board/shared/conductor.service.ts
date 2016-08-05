import { Injectable, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { Agent, DeliveryService, Activities } from './';
import { DISPATCHER, STATE, action, AppState } from '../../shared';

@Injectable()
export class ConductorService {
  constructor(
    private delivery: DeliveryService,
    @Inject(DISPATCHER) private dispatcher: Observer<action>,
    @Inject(STATE) private state: Observable<AppState>) {
  }
}
