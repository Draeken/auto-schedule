import { Component, OnInit, Inject }      from '@angular/core';
import { Observable, Observer }  from 'rxjs';

import { timelineDispatcher, timelineState }  from '../../core/timeline-state/state-dispatcher.provider';
import { TimelineAction }             from '../../core/timeline-state/actions';
import { TimelineState}            from '../../core/timeline-state/timeline-state.interface';
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
    @Inject(timelineDispatcher) private tlDispatcher: Observer<TimelineAction>,
    @Inject(timelineState) private tlState: Observable<TimelineState>,
    private conductor: ConductorService,
    private delivery: DeliveryService
  ) {
    this.tasks = this.firstTasks();
  }

  ngOnInit() {
  }

  private firstTasks(): Observable<Task[]> {
    return this.tlState.pluck('timeline');
  }
}
