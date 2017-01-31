import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import { BoardRoutingModule }     from './board-routing.module';
import { BoardComponent }         from './board.component';
import { ConductorService }       from './gears/conductor.service';
import { DeliveryService }        from './gears/delivery.service';
import { ConflictHandlerService } from './gears/conflict-handler.service';
import { FocusComponent }         from './focus/focus.component';
import { PlanningComponent }      from './planning/planning.component';
import { LoginComponent }         from './login/login.component';
import { LoginService }           from './login.service';

@NgModule({
  imports: [
    CommonModule,
    BoardRoutingModule
  ],
  declarations: [
    BoardComponent,
    FocusComponent,
    PlanningComponent,
    LoginComponent
  ],
  providers: [
    ConductorService,
    DeliveryService,
    ConflictHandlerService,
    LoginService
  ]
})
export class BoardModule {}
