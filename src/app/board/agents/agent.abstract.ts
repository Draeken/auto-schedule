import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { Marker,
         Activities }   from '../gears/activities.class';
import { AgentInfo }      from './agent-info.interface';
import { Permissions,
         Permission }  from './permissions.class';
import { ServiceQuery } from '../gears/service-query.interface';
import { Task,
         TaskStatus }         from '../gears/task.interface';

export abstract class Agent {
  protected requests: Subject<ServiceQuery[]>;
  protected feedbackObs: BehaviorSubject<ServiceQuery[]> = new BehaviorSubject([]);

  constructor(private _service: AgentInfo, timeline: Observable<Task[]>) {
    timeline
      .map(timeline => timeline.filter(task => task.serviceName === _service.name))
      .map(this.lastDoneTask)
      .distinctUntilChanged(this.compareTask)
      .subscribe(this.endTask.bind(this));
  }

  abstract getInfo(taskId: number): string

  abstract askForRequest(): void

  /**
   * Should emit a new request taking into account that this task is done.
   */
  protected abstract endTask(task: Task): void

  protected abstract requestFeedback(timeline: Marker[]): void;

  get feedbackResult(): Observable<ServiceQuery[]> {
    return this.feedbackObs;
  }

  get service(): AgentInfo {
    return Object.assign({}, this._service);
  }

  setRequests(requests: Subject<ServiceQuery[]>): void {
    this.requests = requests;
  }

  feedback(timeline: Activities): void {
    this.requestFeedback(timeline.filter(this._service.name));
  }

  canProvide(collectionName: string): boolean {
    let colPerm = this._service.userPermission.collectionsPerm.find(c => c.collectionName === collectionName);
    return Permissions.getPermissions(colPerm.permission).has(Permission.Provide);
  }

  private lastDoneTask(timeline: Task[]): Task {
    let i = timeline.findIndex(t => t.status === TaskStatus.Sleep);
    if (i === -1) { return undefined; }
    let task = timeline[i];
    while(i >= 0 && task.status !== TaskStatus.Done) {
      task = timeline[--i];
    }
    return i === -1 ? undefined : task;
  }

  private compareTask(ta: Task, tb: Task): boolean {
    if (!ta && !tb) { return true; }
    if (!ta || !tb) { return false; }
    return ta.id === tb.id;
  }

}
