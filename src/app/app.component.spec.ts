/* tslint:disable:no-unused-variable */

import { addProviders, inject } from '@angular/core/testing';

import { AppComponent } from './app.component';

beforeEach(() => addProviders([AppComponent]));

describe('App: AutoSchedule', () => {
  it('should create the app',
      inject([AppComponent], (app: AppComponent) => {
    expect(app).toBeTruthy();
  }));
});
