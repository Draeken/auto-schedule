import { NgModule, Optional, SkipSelf } from '@angular/core';

import { throwIfAlreadyLoaded }       from './module-import-guard';
import { stateAndDispatcherProvider } from './state-dispatcher.provider'

@NgModule({
  imports: [
  ],
  exports: [
  ],
  declarations: [
  ],
  providers: [
    ...stateAndDispatcherProvider
  ]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule ) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
