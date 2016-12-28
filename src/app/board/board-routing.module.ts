import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { BoardComponent }       from './board.component';
import { FocusComponent }       from './focus/focus.component';
import { PlanningComponent }    from './planning/planning.component';
import { AgentSetupComponent }  from './agent-setup/agent-setup.component';
import { agentRouting }         from './agents/agent-routing';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: BoardComponent,
        children: [
          { path: '', component: FocusComponent },
          { path: 'planning', component: PlanningComponent },

        ]
      },
      { path: 'agents', component: AgentSetupComponent, outlet: 'parameter'},
      ...agentRouting
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class BoardRoutingModule { }
