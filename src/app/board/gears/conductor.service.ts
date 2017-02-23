import { Injectable, Inject } from '@angular/core';
import { Observable, Observer, BehaviorSubject } from 'rxjs';

import { ConflictHandlerService } from './conflict-handler.service';
import { DataIOService } from '../../core/data-io.service';
import { DeliveryService } from './delivery.service';
import { Activities } from './activities.class';
import { ServiceQuery } from './service-query.interface';
import { Task,
         distinctCurrentTask,
         extractCurrentTasks,
         TaskStatus } from './task.interface';
import { action,
         UpdateTimelineAction,
         UpdateTaskStatusAction } from '../../shared/actions';
import { AppState } from '../../shared/app-state.interface';
import { dispatcher, state } from '../../core/state-dispatcher.provider';
import { Agent }  from '../agents/agent.abstract';

type AgentsQueries = BehaviorSubject<ServiceQuery[]>[];
interface TimelineContext { agents: Agent[], queries?: AgentsQueries, currentTasks: ServiceQuery[] };
const TIMELINE_DEBOUNCE_TIME = 3500;

@Injectable()
export class ConductorService {
  constructor(private dataIO: DataIOService,
              private delivery: DeliveryService,
              private conflictHandler: ConflictHandlerService,
              @Inject(dispatcher) private dispatcher: Observer<action>,
              @Inject(state) private state: Observable<AppState>) {
    this.delivery.agents
      .combineLatest(this.dataIO.getCurrentTasks(), (agents, tasks) => {
        return { agents: agents, currentTasks: tasks };
      })
      .map(this.createTimelineContext)
      .map(this.buildTimeline.bind(this))
      .subscribe((agents: Agent[]) => agents.forEach(a => a.askForRequest()));

    this.state.pluck('timeline').subscribe(this.handleDoneTasks);
    this.state.pluck('timeline')
      .distinctUntilChanged(distinctCurrentTask)
      .subscribe(this.handleDoneTasks);
  }

  private createTimelineContext(timelineContext: TimelineContext): TimelineContext {
    let agents = timelineContext.agents;
    let agentsQueries: BehaviorSubject<ServiceQuery[]>[] = [];

    agents.forEach(agent => {
      let bs = new BehaviorSubject<ServiceQuery[]>([]);
      agent.setRequests(bs);
      agentsQueries.push(bs);
    });

    timelineContext.queries = agentsQueries;
    return timelineContext;
  }

  private buildTimeline(timelineContext: TimelineContext): Agent[] {
    let queries = timelineContext.queries;
    let agents = timelineContext.agents;
    let queriesObs: Observable<ServiceQuery[]> = Observable.combineLatest(
      queries, (x: ServiceQuery[], y: ServiceQuery[]) => {
        return y ? x.concat(y) : x;
      }
    );
    let currentTasks = timelineContext.currentTasks;
    let timelineObs: Observable<Activities> = queriesObs
      .debounceTime(TIMELINE_DEBOUNCE_TIME)
      .map(queries => queries.concat(currentTasks))
      .map(this.buildActivities)
      .map(this.conflictHandler.tryToResolveConflicts.bind(this.conflictHandler));

    agents.forEach(a => a.setTimeline(timelineObs));
    timelineObs
      .filter(t => t.hasNoConflict) //And assure there is no draft/unprovided resources
      .subscribe(t => this.dispatcher.next(new UpdateTimelineAction(t)));

    return agents;
  }

  private buildActivities(queries: ServiceQuery[]): Activities {
    let activities = new Activities();
    queries.forEach(q => activities.push(q));
    return activities;
  }

  private handleDoneTasks(timeline: Task[]): void {
    let i = timeline.findIndex(t => t.status == TaskStatus.Done);
    let nextTask = timeline[i + 1];
    if (!nextTask) { return; }
    this.dispatcher.next(new UpdateTaskStatusAction(nextTask.serviceName, nextTask.id, TaskStatus.Running));
  }

  /**
   * How to handle pause ?
   */
  private handleEndOfTask(currentTasks: Task[]): void {
    currentTasks.forEach(task => {
      Observable.timer(new Date(task.end)).subscribe(x =>
        new UpdateTaskStatusAction(task.serviceName, task.id, TaskStatus.Done));
    })
  }

}
