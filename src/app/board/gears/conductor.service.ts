import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ConflictHandlerService } from './conflict-handler.service';
import { DataIOService } from '../../core/data-io.service';
import { AgentService } from './agent.service';
import { ResourceMapperService } from './resource-mapper.service';
import { Activities } from './activities.class';
import { AgentQuery } from './agent-query.interface';
import { Task,
         TaskHelper,
         TaskStatus } from './task.interface';
import { TimelineAction,
         UpdateTimelineAction,
         UpdateTaskStatusAction } from '../../core/timeline-state/actions';
import { TimelineState } from '../../core/timeline-state/timeline-state.interface';
import { timelineDispatcher, timelineState } from '../../core/timeline-state/state-dispatcher.provider';
import { Agent } from '../agents/agent.abstract';

type AgentsQueries = BehaviorSubject<AgentQuery[]>[];
interface TimelineContext { agents: Agent[]; queries?: AgentsQueries; currentTasks: AgentQuery[]; };

@Injectable()
export class ConductorService {
  constructor(private dataIO: DataIOService,
              private delivery: AgentService,
              private conflictHandler: ConflictHandlerService,
              private resourceMapper: ResourceMapperService,
              @Inject(timelineDispatcher) private tlDispatcher: Observer<TimelineAction>,
              @Inject(timelineState) private tlState: Observable<TimelineState>) {
    this.handleAgentsChange(this.delivery.agents);
    this.handleTimelineChange(this.tlState.pluck('timeline'));
  }

  private handleAgentsChange(agents: Observable<Agent[]>) {
    agents
      .combineLatest(this.dataIO.getCurrentTasks(), (_agents, tasks) => ({ agents: _agents, currentTasks: tasks }))
      .map(this.createTimelineContext)
      .map(this.buildTimeline.bind(this))
      .subscribe((_agents: Agent[]) => _agents.forEach(a => a.askForRequest()));
  }

  private handleTimelineChange(timeline: Observable<Task[]>) {
    timeline
      .switchMap(this.setTimerForNextTasks)
      .subscribe(this.handleStartedTask);
    timeline
      .map(TaskHelper.extractCurrent)
      .distinctUntilChanged(TaskHelper.distinct)
      .switchMap(this.setTimerForCurrentTasks)
      .subscribe(this.handleTimedTask);
  }

  private createTimelineContext(timelineContext: TimelineContext): TimelineContext {
    const agents = timelineContext.agents;
    const agentsQueries: BehaviorSubject<AgentQuery[]>[] = [];

    agents.forEach(agent => {
      const bs = new BehaviorSubject<AgentQuery[]>([]);
      agent.setRequests(bs);
      agentsQueries.push(bs);
    });

    timelineContext.queries = agentsQueries;
    return timelineContext;
  }

  private buildTimeline(timelineContext: TimelineContext): Agent[] {
    const queries = timelineContext.queries;
    const agents = timelineContext.agents;
    const agentsFeedback = Observable.zip(
      agents.map(a => a.feedbackResult), (x: AgentQuery[], y: AgentQuery[]) => x.concat(y)
    ).filter(fb => fb.length !== 0);
    const queriesObs: Observable<AgentQuery[]> = Observable.combineLatest(
      queries, (..._queries: AgentQuery[][]) =>  _queries.reduce((x, y) => x.concat(y)));
    const filledAgentsFeedback = agentsFeedback.withLatestFrom(queriesObs, this.fillAgentsFeedback);
    const currentTasks = timelineContext.currentTasks;
    const timelineObs: Observable<Activities> = queriesObs.merge(filledAgentsFeedback)
      .map(_queries => _queries.concat(currentTasks))
      .map(_queries => new Activities(_queries))
      .map(this.conflictHandler.tryToResolveConflicts.bind(this.conflictHandler))
      .do((t: Activities) => agents.forEach(a => a.feedback(t)));
    this.resourceMapper.updateTimeline(timelineObs
        .filter(t => t.hasNoConflict)
        .map(t => t.toArray())
      ).subscribe(t => this.tlDispatcher.next(new UpdateTimelineAction(t)));

    return agents;
  }

  private fillAgentsFeedback(feedback: AgentQuery[], queries: AgentQuery[]) {
    const existingAgent: Set<string> = new Set();
    feedback.forEach(sq => existingAgent.add(sq.agentName));
    queries.forEach(sq => {
      if (existingAgent.has(sq.agentName)) { return; }
      feedback.push(sq);
    });
    return feedback;
  }

  private setTimerForNextTasks(timeline: Task[]): Observable<Task> {
    // Logic to handle paused/extended tasks

    const nextTasks = TaskHelper.extractNext(timeline);
    return Observable.merge(...nextTasks.map(task => {
      return Observable.timer(new Date(task.start)).map(x => task);
    }));
  }

  private setTimerForCurrentTasks(currentTasks: Task[]): Observable<Task> {
    return Observable.merge(...currentTasks.map(task => {
      return Observable.timer(new Date(task.end)).map(x => task);
    }));
  }

  private handleTimedTask(timedTask: Task): void {
    // Logic to handle "do not autoterminate" flag
    this.tlDispatcher.next(new UpdateTaskStatusAction(timedTask, TaskStatus.Done));
  }

  private handleStartedTask(startedTask: Task): void {
    this.tlDispatcher.next(new UpdateTaskStatusAction(startedTask, TaskStatus.Running));
  }

}
