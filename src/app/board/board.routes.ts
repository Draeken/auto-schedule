import { RouterConfig }   from '@angular/router';

import { BoardComponent } from './board.component';
import { FocusComponent } from './focus/focus.component';

export const BOARD_ROUTES: RouterConfig = [
  {
    path: '',
    component: BoardComponent,
    children: [
      { path: '', component: FocusComponent }
    ]
  }
];
