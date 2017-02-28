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
         extractNextTasks,
         TaskStatus } from './task.interface';
import { TimelineAction,
         UpdateTimelineAction,
         UpdateTaskStatusAction } from '../../core/timeline-state/actions';
import { TimelineState } from '../../core/timeline-state/timeline-state.interface';
import { timelineDispatcher, timelineState } from '../../core/timeline-state/state-dispatcher.provider';
import { Agent }  from '../agents/agent.abstract';

type AgentsQueries = BehaviorSubject<ServiceQuery[]>[];
interface TimelineContext { agents: Agent[], queries?: AgentsQueries, currentTasks: ServiceQuery[] };
const TIMELINE_DEBOUNCE_TIME = 3500;

@Injectable()
export class ConductorService {
  constructor(private dataIO: DataIOService,
              private delivery: DeliveryService,
              private conflictHandler: ConflictHandlerService,
              @Inject(timelineDispatcher) private tlDispatcher: Observer<TimelineAction>,
              @Inject(timelineState) private tlState: Observable<TimelineState>) {
    this.handleAgentsChange(this.delivery.agents);
    this.handleTimelineChange(this.tlState.pluck('timeline'));
  }

  private handleAgentsChange(agents: Observable<Agent[]>) {
    agents
      .combineLatest(this.dataIO.getCurrentTasks(), (agents, tasks) => ({ agents: agents, currentTasks: tasks }))
      .map(this.createTimelineContext)
      .map(this.buildTimeline.bind(this))
      .subscribe((agents: Agent[]) => agents.forEach(a => a.askForRequest()));
  }

  private handleTimelineChange(timeline: Observable<Task[]>) {
    timeline
      .switchMap(this.setTimerForNextTasks)
      .subscribe(this.handleStartedTask);
    timeline
      .map(extractCurrentTasks)
      .distinctUntilChanged(distinctCurrentTask)
      .switchMap(this.setTimerForCurrentTasks)
      .subscribe(this.handleTimedTask);
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
    let agentsFeedback: Observable<ServiceQuery[]> = Observable.of([]);//Filtered
    let queriesObs: Observable<ServiceQuery[]> = Observable.combineLatest(
      queries, (x: ServiceQuery[], y: ServiceQuery[]) =>  y ? x.concat(y) : x);
    let filledAgentsFeedback = agentsFeedback.withLatestFrom(queriesObs, this.fillAgentsFeedback);
    let currentTasks = timelineContext.currentTasks;
    let timelineObs: Observable<Activities> = queriesObs.merge(filledAgentsFeedback)
      .map(queries => queries.concat(currentTasks))
      .map(this.buildActivities)
      .map(this.conflictHandler.tryToResolveConflicts.bind(this.conflictHandler));

    agentsFeedback = Observable.zip(
      agents.map(a => a.feedback(timelineObs)), (x: ServiceQuery[], y: ServiceQuery[]) => x.concat(y)
    ).filter(fb => fb.length !== 0);
    timelineObs
      .filter(t => t.hasNoConflict) //And assure there is no draft/unprovided resources
      .subscribe(t => this.tlDispatcher.next(new UpdateTimelineAction(t)));

    return agents;
  }

  private fillAgentsFeedback(feedback: ServiceQuery[], queries: ServiceQuery[]) {
    let existingAgent: Set<string> = new Set();
    feedback.forEach(sq => existingAgent.add(sq.agentName));
    queries.forEach(sq => {
      if (existingAgent.has(sq.agentName)) { return; }
      feedback.push(sq);
    });
    return feedback;
  }

  private buildActivities(queries: ServiceQuery[]): Activities {
    let activities = new Activities();
    queries.forEach(q => activities.push(q));
    return activities;
  }

  private setTimerForNextTasks(timeline: Task[]): Observable<Task> {
    //Logic to handle paused/extended tasks
    let nextTasks = extractNextTasks(timeline);
    return Observable.merge(...nextTasks.map(task => {
      return Observable.timer(new Date(task.start)).map(x => task)
    }));
  }

  private setTimerForCurrentTasks(currentTasks: Task[]): Observable<Task> {
    return Observable.merge(...currentTasks.map(task => {
      return Observable.timer(new Date(task.end)).map(x => task);
    }))
  }

  private handleTimedTask(timedTask: Task): void {
    //Logic to handle "do not autoterminate" flag
    this.tlDispatcher.next(new UpdateTaskStatusAction(timedTask.serviceName, timedTask.id, TaskStatus.Done))
  }

  private handleStartedTask(startedTask: Task): void {
    this.tlDispatcher.next(new UpdateTaskStatusAction(startedTask.serviceName, startedTask.id, TaskStatus.Running));
  }

}
