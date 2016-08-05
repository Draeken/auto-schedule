/* tslint:disable:no-unused-variable */

import { addProviders, inject } from '@angular/core/testing';

import { ConductorService } from './conductor.service';
import { DeliveryService } from './delivery.service';
import { Agent } from './agent.interface';

class TestDeliveryService {
  getServices() {
    return [<Agent>{
    }];
  }
}

describe('Conductor Service', () => {
  beforeEach(() => {
    addProviders([
      { provide: DeliveryService, useClass: TestDeliveryService },
      ConductorService
    ]);
  });

  it('should ...',
      inject([ConductorService], (service: ConductorService) => {
    expect(service).toBeTruthy();
  }));
});
