import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/switch';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/merge';


import { Timeline } from './timeline/timeline.class';
import { DataIOService } from '../../core/data-io.service';
import { AgentService } from './agent.service';
import { ResourceMapperService } from './resource-mapper.service';
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
              private resourceMapper: ResourceMapperService,
              @Inject(timelineDispatcher) private tlDispatcher: Observer<TimelineAction>,
              @Inject(timelineState) private tlState: Observable<TimelineState>) {
    this.handleAgentsChange(this.delivery.agents);
    this.handleTimelineChange(this.tlState.map(t => t.timeline));
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
      .subscribe(this.handleStartedTask.bind(this), v => console.error('error:', v));
    timeline
      .map(TaskHelper.extractCurrent)
      .distinctUntilChanged(TaskHelper.distinct)
      .switchMap(this.setTimerForCurrentTasks)
      .subscribe(this.handleTimedTask.bind(this), v => console.error('error:', v));
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
    queriesObs.subscribe(data => console.log('queriesObs', data));
    queriesObs.merge(filledAgentsFeedback)
      .map(_queries => _queries.concat(currentTasks))
      .map(_queries => new Timeline(this.resourceMapper, _queries))
      .map((t: Timeline) => t.toPlacement())
      .switch()
      .do(p => agents.forEach(a => a.feedback(p)))
      .map(placements => placements.map(p => {
        const now = Date.now();
        const t: Task = { start: p.start, end: p.end, query: p.query, status: p.start < now ? TaskStatus.Running : TaskStatus.Sleep };
        return t;
      }))
      .withLatestFrom(this.delivery.agents)
      .map(pa => this.resourceMapper.updateTimeline(pa[0], pa[1]))
      .filter(p => p !== undefined)
      .subscribe(p => this.tlDispatcher.next(new UpdateTimelineAction(p)));

    return agents;
  }

  private fillAgentsFeedback(feedback: AgentQuery[], queries: AgentQuery[]) {
    const existingAgent: Set<string> = new Set();
    feedback.forEach(sq => existingAgent.add(sq.taskIdentity.agentName));
    queries.forEach(sq => {
      if (existingAgent.has(sq.taskIdentity.agentName)) { return; }
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
