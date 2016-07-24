/* tslint:disable:no-unused-variable */

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';
import { ConductorService } from './conductor.service';

describe('Root Service', () => {
  beforeEachProviders(() => [ConductorService]);

  it('should ...',
      inject([ConductorService], (service: ConductorService) => {
    expect(service).toBeTruthy();
  }));
});
