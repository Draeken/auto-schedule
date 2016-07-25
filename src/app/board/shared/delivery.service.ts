import { Injectable } from '@angular/core';

import { SleepAgent } from './sleep.agent';

@Injectable()
export class DeliveryService {

  constructor() {}

  getServices() {
    return [new SleepAgent()];
  }

}
