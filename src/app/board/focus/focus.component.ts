import { Component, OnInit, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { Activity } from '../shared';
import { DISPATCHER, STATE, action, AppState } from '../../shared';

@Component({
  moduleId: module.id,
  selector: 'app-focus',
  templateUrl: 'focus.component.html',
  styleUrls: ['focus.component.css'],
  providers: []
})
export class FocusComponent implements OnInit {

  constructor(
    @Inject(DISPATCHER) private dispatcher: Observer<action>,
    @Inject(STATE) private state: Observable<AppState>
  ) { }

  get currentActivity() {
    return this.state.map(s => this.computeCurrentActivity(s.activities));
  }

  private computeCurrentActivity(activities: Activity[]): Activity {
    return activities.find(a => true);
  }

  ngOnInit() {
  }

}
