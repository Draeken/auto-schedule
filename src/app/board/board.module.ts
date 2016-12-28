import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import { BoardRoutingModule }     from './board-routing.module';
import { BoardComponent }         from './board.component';
import { ConductorService }       from './gears/conductor.service';
import { DeliveryService }        from './gears/delivery.service';
import { ConflictHandlerService } from './gears/conflict-handler.service';
import { FocusComponent }         from './focus/focus.component';
import { PlanningComponent }      from './planning/planning.component';
import { AgentSetupComponent } from './agent-setup/agent-setup.component';
import { SleepConfigComponent } from './agents/sleep/sleep-config/sleep-config.component';

@NgModule({
  imports: [
    CommonModule,
    BoardRoutingModule
  ],
  declarations: [
    BoardComponent,
    FocusComponent,
    PlanningComponent,
    AgentSetupComponent,
    SleepConfigComponent
  ],
  providers: [
    ConductorService,
    DeliveryService,
    ConflictHandlerService
  ]
})
export class BoardModule {}
