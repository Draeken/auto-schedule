import { Component, OnInit, Inject }      from '@angular/core';
import { Observable, Observer }  from 'rxjs';

import { dispatcher, state }  from '../../core/state-dispatcher.provider';
import { action }             from '../../shared/actions';
import { AppState}            from '../../shared/app-state.interface';
import { Task }               from '../gears/task.interface';
import { ConductorService }   from '../gears/conductor.service';
import { DeliveryService }    from '../gears/delivery.service';

@Component({
  selector: 'as-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {
  private tasks: Observable<Task[]>;

  constructor(
    @Inject(dispatcher) private dispatcher: Observer<action>,
    @Inject(state) private state: Observable<AppState>,
    private conductor: ConductorService,
    private delivery: DeliveryService
  ) {
    this.tasks = this.firstTasks();
  }

  ngOnInit() {
  }

  private firstTasks(): Observable<Task[]> {
    return this.state.pluck('timeline');
  }
}
