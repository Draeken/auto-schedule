/* tslint:disable:no-unused-variable */

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';
import { DeliveryService } from './delivery.service';

describe('Delivery Service', () => {
  beforeEachProviders(() => [DeliveryService]);

  it('should ...',
      inject([DeliveryService], (service: DeliveryService) => {
    expect(service).toBeTruthy();
  }));
});
