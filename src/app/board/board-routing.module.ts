import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { BoardComponent } from './board.component';
import { FocusComponent } from './focus/focus.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: BoardComponent,
        children: [
          { path: '', component: FocusComponent }
        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class BoardRoutingModule { }
