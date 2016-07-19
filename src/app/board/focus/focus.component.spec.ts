/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import {
  beforeEach, beforeEachProviders,
  describe, xdescribe,
  expect, it, xit,
  async, inject
} from '@angular/core/testing';

import { FocusComponent } from './focus.component';
import { RootService} from '../shared/root.service'

describe('Component: Focus', () => {
  it('should create an instance', () => {
    let component = new FocusComponent(new RootService());
    expect(component).toBeTruthy();
  });
});
