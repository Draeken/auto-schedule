import { Component, OnInit, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { Task, ConductorService } from '../shared';
import { DISPATCHER, STATE, action, AppState } from '../../shared';

@Component({
  moduleId: module.id,
  selector: 'app-focus',
  templateUrl: 'focus.component.html',
  styleUrls: ['focus.component.css'],
  providers: []
})
export class FocusComponent implements OnInit {
  private firstActivity: Task;

  constructor(
    @Inject(DISPATCHER) private dispatcher: Observer<action>,
    @Inject(STATE) private state: Observable<AppState>,
    private conductor: ConductorService
  ) {
    this.conductor.schedule.subscribe(schedule => {
      this.firstActivity = schedule.firstTask;
    });
  }

  ngOnInit() {
  }

}
