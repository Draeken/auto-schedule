import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Timeline } from '../gears/timeline/timeline.class';
import { Placement } from '../gears/timeline/placement.class';
import { AgentInfo } from './agent-info.interface';
import { Permissions,
         Permission } from './permissions.class';
import { AgentQuery } from '../gears/agent-query.interface';
import { Task,
         TaskStatus } from '../gears/task.interface';
import { RequestToAgent } from '../gears/resource-mapper.service';

export abstract class Agent {
  protected requests: Subject<AgentQuery[]>;
  protected feedbackObs: BehaviorSubject<AgentQuery[]> = new BehaviorSubject([]);

  constructor(private _service: AgentInfo) {
  }

  abstract getInfo(taskId: number): string

  abstract askForRequest(): void

  abstract notifyStateChange(payload: Object): void

  abstract askToProvide(payload: RequestToAgent[]): void

  /**
   * Should emit a new request taking into account that this task is done.
   */
  protected abstract endTask(task: Task): void

  protected abstract requestFeedback(timeline: Placement[]): void;

  get feedbackResult(): Observable<AgentQuery[]> {
    return this.feedbackObs;
  }

  get service(): AgentInfo {
    return Object.assign({}, this._service);
  }

  setRequests(requests: Subject<AgentQuery[]>): void {
    this.requests = requests;
  }

  feedback(timeline: Timeline): void {
    this.requestFeedback(timeline.filter(this._service.name));
  }

  canProvide(collectionName: string): boolean {
    const colPerm = this._service.userPermission.collectionsPerm.find(c => c.collectionName === collectionName);
    return Permissions.getPermissions(colPerm.permission).has(Permission.Provide);
  }
}
