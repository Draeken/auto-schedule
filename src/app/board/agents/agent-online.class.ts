import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Agent, TaskWithDesc } from './agent.abstract';
import { Timeline } from '../gears/timeline/timeline.class';
import { Placement } from '../gears/timeline/placement.class';
import { Task } from '../gears/task.interface';
import { AgentInfo } from './agent-info.interface';
import { AgentQuery, objToAgentQuery } from '../gears/agent-query.interface';
import { RequestToAgent } from '../gears/resource-mapper.service';
import { DataIOService } from '../../core/data-io.service';

export class AgentOnline extends Agent {

  constructor(private http: Http, private dataIo: DataIOService, service: AgentInfo) {
    super(service);
  }

  getInfo(task: Task): Observable<TaskWithDesc> {
    const payload = {
      token: this.dataIo.getAgentToken(this.service.name)
    };
    return this.http.post(`${this.service.url}/description/${task.query.taskIdentity.id}`, payload, this.dataIo.getJsonHeader())
      .map(res => this.dataIo.extractBody.call(this.dataIo, res))
      .map((body: any) => ({
        task: task,
        description: body.description
      }));
  }

  askForRequest(): void {
    const payload = {
      token: this.dataIo.getAgentToken(this.service.name)
    };
    this.http.post(`${this.service.url}/request`, payload, this.dataIo.getJsonHeader())
      .map(res => this.dataIo.extractBody.call(this.dataIo, res))
      .subscribe(this.handleNewRequest.bind(this));
    console.info('ask for request');
  }

  notifyStateChange(payload: Object): void {
    console.info('notify state change', payload);
  }

  askToProvide(payload: RequestToAgent[]): void {
    console.info('ask to provide', payload);
  }

  protected endTask(task: Task): void {
    console.info('end task', task);
  }

  protected requestFeedback(timeline: Placement[]): void {
    console.log(this.service.name, timeline);
  }

  private handleNewRequest(body: any): void {
    const request = objToAgentQuery(body.request, this.service.name);
    if (!request) {
      console.warn('Request failed.', this.service, body.request);
      return;
    }
    if (Array.isArray(request)) {
      this.requests.next(request);
    } else {
      this.requests.next([request]);
    }
  }
}
