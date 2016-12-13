import { NgModule }       from '@angular/core';
import { FormsModule }    from '@angular/forms';
import { CommonModule }   from '@angular/common';

import { BoardRoutingModule }     from './board-routing.module';
import { BoardComponent }         from './board.component';
import { ConductorService }       from './gears/conductor.service';
import { DeliveryService }        from './gears/delivery.service';
import { ConflictHandlerService } from './gears/conflict-handler.service';
import { FocusComponent }         from './focus/focus.component';
import { PlanningComponent }      from './planning/planning.component';
import { CreateTaskComponent }    from './create-task/create-task.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BoardRoutingModule
  ],
  declarations: [
    BoardComponent,
    FocusComponent,
    PlanningComponent,
    CreateTaskComponent
  ],
  providers: [
    ConductorService,
    DeliveryService,
    ConflictHandlerService
  ]
})
export class BoardModule {}
