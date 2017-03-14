import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { Marker,
         Activities }   from '../gears/activities.class';
import { AgentInfo }      from './agent-info.interface';
import { Permissions,
         Permission }  from './permissions.class';
import { AgentQuery } from '../gears/agent-query.interface';
import { Task,
         TaskStatus }         from '../gears/task.interface';
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

  protected abstract requestFeedback(timeline: Marker[]): void;

  get feedbackResult(): Observable<AgentQuery[]> {
    return this.feedbackObs;
  }

  get service(): AgentInfo {
    return Object.assign({}, this._service);
  }

  setRequests(requests: Subject<AgentQuery[]>): void {
    this.requests = requests;
  }

  feedback(timeline: Activities): void {
    this.requestFeedback(timeline.filter(this._service.name));
  }

  canProvide(collectionName: string): boolean {
    let colPerm = this._service.userPermission.collectionsPerm.find(c => c.collectionName === collectionName);
    return Permissions.getPermissions(colPerm.permission).has(Permission.Provide);
  }
}
