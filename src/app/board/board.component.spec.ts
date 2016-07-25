/* tslint:disable:no-unused-variable */

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { addProviders, inject } from '@angular/core/testing';

import { BoardComponent } from './board.component';

describe('Component: Board', () => {
  it('should create an instance', () => {
    let component = new BoardComponent();
    expect(component).toBeTruthy();
  });
});
