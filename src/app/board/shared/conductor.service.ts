import { Injectable } from '@angular/core';

import { DeliveryService } from './delivery.service';
import { Agent } from './agent.interface';

@Injectable()
export class ConductorService {
  private services: Agent[];
  private curActivity: string;

  constructor(private delivery: DeliveryService) {
    this.services = delivery.getServices();
    this.curActivity = 'Coder.';
  }

  get currentActivity() {
    return this.curActivity;
  }

}
