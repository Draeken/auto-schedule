import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { timelineDispatcher, timelineState } from '../../core/timeline-state/state-dispatcher.provider';
import { TimelineAction } from '../../core/timeline-state/actions';
import { TimelineState} from '../../core/timeline-state/timeline-state.interface';
import { Task } from '../gears/task.interface';
import { ConductorService } from '../gears/conductor.service';
import { AgentService } from '../gears/agent.service';

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
    private delivery: AgentService
  ) {
    this.tasks = this.firstTasks();
    //this.tlState.subscribe(tasks => console.info('as-planning', tasks));
  }

  ngOnInit() {
  }

  private firstTasks(): Observable<Task[]> {
    return this.tlState.pluck('timeline');
  }
}
