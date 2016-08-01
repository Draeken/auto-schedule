import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Activity } from '../board/shared';
import { DISPATCHER, STATE, action, AppState } from './';

@Injectable()
export class DataIO {

  constructor(
    @Inject(DISPATCHER) private dispatcher: Observable<action>,
    @Inject(STATE) private state: Observable<AppState>
  ) { }

}
