/* tslint:disable:no-unused-variable */

import { addProviders, inject } from '@angular/core/testing';
import { DeliveryService } from './delivery.service';

describe('Delivery Service', () => {
  beforeEach(() => addProviders([DeliveryService]));

  it('should ...',
      inject([DeliveryService], (service: DeliveryService) => {
    expect(service).toBeTruthy();
  }));
});
