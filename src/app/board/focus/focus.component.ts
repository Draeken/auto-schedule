import { Component, OnInit, Inject }      from '@angular/core';
import { Observable, Observer }  from 'rxjs';

import { timelineDispatcher,
         timelineState }  from '../../core/timeline-state/state-dispatcher.provider';
import { TimelineAction }             from '../../core/timeline-state/actions';
import { TimelineState}            from '../../core/timeline-state/timeline-state.interface';
import { Task,
         TaskHelper} from '../gears/task.interface';
import { ConductorService }   from '../gears/conductor.service';
import { AgentService }    from '../gears/agent.service';
import { Agent }              from '../agents/agent.abstract';

@Component({
  selector: 'as-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.sass']
})
export class FocusComponent implements OnInit {
  private tasks: Observable<Task[]>;
  private timelefts: Observable<number[]>;

  constructor(
    @Inject(timelineDispatcher) private tlDispatcher: Observer<TimelineAction>,
    @Inject(timelineState) private tlState: Observable<TimelineState>,
    private conductor: ConductorService,
    private delivery: AgentService
  ) {
    this.tasks = this.firstTasks();
    this.timelefts = this.computeTimelefts();
  }

  ngOnInit() {
  }

  get tasksDescription(): Observable<string[]> {
    return Observable.combineLatest(this.delivery.agents, this.tasks, (a: Agent[], t: Task[]) => {return { agents: a, tasks: t }; })
      .map(value => {
        return value.tasks.map(t => {
          return value.agents.find(a => a.service.name === t.query.agentName).getInfo(t.query.id);
        });
      });
  }

  private computeTimelefts(): Observable<number[]> {
    let timerObs = Observable.interval(1000);
    return Observable.combineLatest(this.tasks.map(tasks => tasks.map(task => {
      return task.end;
    })), timerObs)
      .map((val: [number[], number]) => [val[0], Date.now()])
      .map((val: [number[], number]) => val[0].map(end => end - val[1]));
  }

  private firstTasks(): Observable<Task[]> {
    return this.tlState.pluck('timeline').map(TaskHelper.extractCurrent);
  }
}
