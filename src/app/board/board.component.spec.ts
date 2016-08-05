/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { addProviders, inject } from '@angular/core/testing';

import { BoardComponent } from './board.component';
import { DeliveryService, ConductorService } from './shared';

describe('Component: Board', () => {
  beforeEach(() => addProviders([DeliveryService, ConductorService, BoardComponent]));


  it('should ...',
      inject([BoardComponent], (component: BoardComponent) => {
    expect(component).toBeTruthy();
  }));

});
