import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Agent } from './agent.abstract';
import { Timeline } from '../gears/timeline/timeline.class';
import { Placement } from '../gears/timeline/placement.class';
import { Task } from '../gears/task.interface';
import { AgentInfo } from './agent-info.interface';
import { AgentQuery, objToAgentQuery } from '../gears/agent-query.interface';
import { RequestToAgent } from '../gears/resource-mapper.service';

export class AgentOnline extends Agent {

  constructor(private http: Http, service: AgentInfo) {
    super(service);
  }

  getInfo(taskId: number): string {
    return 'test';
}

  askForRequest(): void {
    this.http.get(`${this.service.url}/request`)
      .map(this.extractAgentQueries.bind(this))
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

  private handleNewRequest(request): void {
    if (!request) {
      console.warn('Request failed.', this.service);
      return;
    }
    if (Array.isArray(request)) {
      this.requests.next(request);
    } else {
      this.requests.next([request]);
    }
  }

  private extractAgentQueries(res: Response): AgentQuery {
    let body;
    try {
      body = res.json();
    } catch (e) {
      return undefined;
    }
    return objToAgentQuery(body.request, this.service.name);
  }
}
