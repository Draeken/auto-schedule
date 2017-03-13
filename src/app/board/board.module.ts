import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';

import { BoardRoutingModule }     from './board-routing.module';
import { BoardComponent }         from './board.component';
import { ConductorService }       from './gears/conductor.service';
import { AgentService }        from './gears/agent.service';
import { ConflictHandlerService } from './gears/conflict-handler.service';
import { ResourceMapperService }  from './gears/resource-mapper.service';
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
    AgentService,
    ConflictHandlerService,
    LoginService,
    ResourceMapperService
  ]
})
export class BoardModule {}
