import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { BoardComponent }     from './board.component';
import { FocusComponent }     from './focus/focus.component';
import { PlanningComponent }  from './planning/planning.component';

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
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class BoardRoutingModule { }
