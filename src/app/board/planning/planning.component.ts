import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observer } from 'rxjs/Observer';

import { timelineDispatcher, timelineState } from '../../core/timeline-state/state-dispatcher.provider';
import { TimelineAction } from '../../core/timeline-state/actions';
import { TimelineState} from '../../core/timeline-state/timeline-state.interface';
import { Task } from '../gears/task.interface';
import { ConductorService } from '../gears/conductor.service';
import { AgentService } from '../gears/agent.service';
import { Agent, TaskWithDesc } from '../agents/agent.abstract';

@Component({
  selector: 'as-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})

export class PlanningComponent implements OnInit {
  private tasks: Observable<TaskWithDesc[]>;
  private agents: BehaviorSubject<Agent[]> = new BehaviorSubject([]);

  constructor(
    @Inject(timelineDispatcher) private tlDispatcher: Observer<TimelineAction>,
    @Inject(timelineState) private tlState: Observable<TimelineState>,
    private conductor: ConductorService,
    private delivery: AgentService
  ) {

    this.tasks = this.firstTasks().withLatestFrom(this.delivery.agents).map(values => {
      const obs: Observable<TaskWithDesc>[] = values[0].map(
        task => values[1].find(a => a.service.name === task.query.taskIdentity.agentName).getInfo(task));
      return Observable.combineLatest(obs);
    }).switch();
  }

  ngOnInit() {
  }

  private firstTasks(): Observable<Task[]> {
    return this.tlState.pluck('timeline');
  }
}
