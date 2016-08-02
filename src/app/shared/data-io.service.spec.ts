/* tslint:disable:no-unused-variable */

import { addProviders, async, inject } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { action, stateFn, AppState, STATE_AND_DISPATCHER, DataIO } from './';

describe('Service: DataIO', () => {

  beforeEach(() => addProviders([...STATE_AND_DISPATCHER, DataIO]));

  it('should ...', inject([DataIO], (service: DataIO) => {
    expect(service).toBeTruthy();
  }));
});
