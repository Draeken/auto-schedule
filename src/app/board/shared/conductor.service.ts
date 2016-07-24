import { Injectable } from '@angular/core';

import { DeliveryService } from './delivery.service';
import { BaseAgent } from './base.agent';

@Injectable()
export class ConductorService {
  private services: BaseAgent[];
  private curActivity: string;

  constructor(private delivery: DeliveryService) {
    this.services = delivery.getServices();
    this.curActivity = 'Coder.';
  }

  get currentActivity() {
    return this.curActivity;
  }

}
