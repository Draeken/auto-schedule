/* tslint:disable:no-unused-variable */

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';
import { SleepService } from './sleep.service';

describe('Sleep Service', () => {
  beforeEachProviders(() => [SleepService]);

  it('should ...',
      inject([SleepService], (service: SleepService) => {
    expect(service).toBeTruthy();
  }));
});
