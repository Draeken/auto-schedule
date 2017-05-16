import { NgModule, Optional, SkipSelf } from '@angular/core';

import { DataIOService } from './data-io.service';
import { throwIfAlreadyLoaded } from './module-import-guard';
import { appStateAndDispatcherProvider } from './app-state/state-dispatcher.provider';
import { timelineStateAndDispatcherProvider } from './timeline-state/state-dispatcher.provider';
import { WindowRef } from './window.provider';

@NgModule({
  imports: [
  ],
  exports: [
  ],
  declarations: [
  ],
  providers: [
    DataIOService,
    ...appStateAndDispatcherProvider,
    ...timelineStateAndDispatcherProvider,
    WindowRef
  ]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule ) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
