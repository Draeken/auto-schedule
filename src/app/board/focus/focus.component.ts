import { Component, OnInit, Inject }      from '@angular/core';
import  { Observable, Observer }  from 'rxjs';

import { dispatcher, state }  from '../../core/state-dispatcher.provider';
import { action }             from '../../shared/actions';
import { AppState}            from '../../shared/app-state.interface';
import { Task }               from '../gears/task.interface';
import { ConductorService }   from '../gears/conductor.service';
import { DeliveryService }    from '../gears/delivery.service';

@Component({
  selector: 'app-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.sass']
})
export class FocusComponent implements OnInit {

  constructor(
    @Inject(dispatcher) private dispatcher: Observer<action>,
    @Inject(state) private state: Observable<AppState>,
    private conductor: ConductorService,
    private delivery: DeliveryService

  ) { }

  get firstActivity(): Observable<string[]> {
    return this.conductor.schedule.map(schedule => schedule.firstTasks).map(tasks => tasks.map(t => {
      let agent = this.delivery.getAgent(t.serviceName);
      return agent.getInfo(t.id);
    }));
  }

  ngOnInit() {
  }

}
