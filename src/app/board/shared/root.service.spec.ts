/* tslint:disable:no-unused-variable */

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';
import { RootService } from './root.service';

describe('Root Service', () => {
  beforeEachProviders(() => [RootService]);

  it('should ...',
      inject([RootService], (service: RootService) => {
    expect(service).toBeTruthy();
  }));
});
