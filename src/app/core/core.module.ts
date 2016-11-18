import { NgModule, Optional, SkipSelf } from '@angular/core';

import { DataIOService }              from './data-io.service';
import { throwIfAlreadyLoaded }       from './module-import-guard';
import { stateAndDispatcherProvider } from './state-dispatcher.provider';

@NgModule({
  imports: [
  ],
  exports: [
  ],
  declarations: [
  ],
  providers: [
    DataIOService,
    ...stateAndDispatcherProvider
  ]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule ) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
