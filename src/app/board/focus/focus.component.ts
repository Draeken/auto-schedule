import { Component, OnInit, Inject }      from '@angular/core';
import { Observable, Observer }  from 'rxjs';

import { dispatcher, state }  from '../../core/state-dispatcher.provider';
import { action }             from '../../shared/actions';
import { AppState}            from '../../shared/app-state.interface';
import { Task,
         extractCurrentTasks} from '../gears/task.interface';
import { ConductorService }   from '../gears/conductor.service';
import { DeliveryService }    from '../gears/delivery.service';
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
    @Inject(dispatcher) private dispatcher: Observer<action>,
    @Inject(state) private state: Observable<AppState>,
    private conductor: ConductorService,
    private delivery: DeliveryService
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
          return value.agents.find(a => a.service.name === t.serviceName).getInfo(t.id);
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
    return this.state.pluck('timeline').map(extractCurrentTasks);
  }
}
