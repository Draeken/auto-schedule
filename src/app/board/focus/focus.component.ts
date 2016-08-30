import { Component, OnInit, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { Task, ConductorService, DeliveryService } from '../shared';
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
    @Inject(STATE) private state: Observable<AppState>,
    private conductor: ConductorService,
    private delivery: DeliveryService
  ) { }

  get firstActivity(): Observable<string> {
    return this.conductor.schedule.map(schedule => {
      const firstTask = schedule.firstTask;
      if (firstTask === null) {
        return 'Aucune activitée';
      }
      let agent = this.delivery.getAgent(firstTask.serviceName);
      return agent.getInfo(firstTask.id);
    });
  }

  ngOnInit() {
  }

}
