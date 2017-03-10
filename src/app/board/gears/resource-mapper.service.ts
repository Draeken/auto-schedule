import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DeliveryService }  from './delivery.service';
import { DataIOService }  from '../../core/data-io.service';
import { Task,
         TaskTransformNeed,
         TaskTransformUpdate,
         TaskTransformInsert,}       from './task.interface';
import { Agent }  from '../agents/agent.abstract';
import { Permission }  from '../agents/permissions.class';

interface Resource {
  objects: Object[];
  ref: string;
  collectionName: string;
}

interface RequestToAgent {
  need: TaskTransformNeed;
  targetTime: number;
  taskId: number;
  serviceName: string;
  context: any;
}

class ProviderManager {
  private agentRequestMap = new Map<Agent, RequestToAgent[]>();
  private currentTask: Task;
  private _isValid = true;

  constructor(private agents: Agent[], private dataIo: DataIOService) {
    agents.forEach(m => this.agentRequestMap.set(m, []));
  }

  set task(task: Task) { this.currentTask = task; }
  get isValid(): boolean { return this._isValid; }

  pushNeed(need: TaskTransformNeed): void {
    this.agentRequestMap.forEach((requests, agent) => {
      if (!agent.canProvide(need.collectionName)) { return; }
      requests.push({
        need: need,
        targetTime: this.currentTask.start,
        taskId: this.currentTask.id,
        serviceName: this.currentTask.serviceName,
        context: this.getContext(agent)
      });
    })
    this._isValid = false;
  }

  private getContext(agent: Agent): any[] {
    let context;
    let agentPerm = agent.service.userPermission;
    let queries = new Map<string, Object[]>();

    //Maybe use empty array instead of {}
    agentPerm.getCollectionsWith(Permission.Context).forEach(c => queries.set(c, [{}]));
    agentPerm.getDocumentsWith(Permission.Context).forEach(d => {
      if (queries.has(d.collectionName)) {
        queries.get(d.collectionName).push(d.documentsDesc);
      } else {
        queries.set(d.collectionName, [d.documentsDesc]);
      }
    });
    return this.executeQueries(queries);
  }

  private executeQueries(queriesMap: Map<string, Object[]>): any[] {
    let results = [];
    queriesMap.forEach((queries, collName) => {
      let coll = this.dataIo.getCollection(collName);
      queries.forEach(q => results.concat(coll.find(q)));
    });
    return results;
  }
}

@Injectable()
export class ResourceMapperService {

  constructor(private delivery: DeliveryService, private dataIo: DataIOService) {
  }

  updateTimeline(t: Observable<Task[]>): Observable<any> {
    return t
      .withLatestFrom(this.delivery.agents)
      .map(this.parseActivities)
      .filter(c => c[1])
      .map(c => c[0]);
  }

  private parseActivities(c: [Task[], Agent[]]): [Task[], boolean] {
    let tasks = c[0];
    let agents = c[1];
    let providerManager = new ProviderManager(agents, this.dataIo);

    tasks.forEach(task => {
      let resources: Resource[];
      providerManager.task = task;
      task.transform.needs.forEach(this.handleNeeds.bind(this, resources, providerManager));
      task.transform.updates.forEach(this.handleUpdates.bind(this, resources));
      task.transform.inserts.forEach(this.handleInserts);

      resources.forEach(resource => {
        let col = this.dataIo.getCollection(resource.collectionName);
        resource.objects.forEach(obj => col.remove(obj));
      });
    });

    return [tasks, providerManager.isValid];
  }

  private handleNeeds(resources: Resource[], providerManager: ProviderManager, need: TaskTransformNeed) {
    let col = this.dataIo.getCollection(need.collectionName);
    if (!col) {
      console.error(`Collection ${need.collectionName} doesn't exist.`);
      providerManager.pushNeed(need);
      //Call all agents with corresponding blabla
      return;
    }
    let objs = col.find(need.find);
    if (objs.length < need.quantity) {
      //Push agent request and send all in one time with delivery method. Agents will respond with feedback obs.
      providerManager.pushNeed(need);
      return;
    }
    resources.push({ objects: objs.slice(0, need.quantity), ref: need.ref, collectionName: need.collectionName });
  }

  private handleUpdates(resources: Resource[], update: TaskTransformUpdate) {
    let resourceI = resources.findIndex(r => r.ref === update.ref);
    let resource = resources[resourceI];
    resources.splice(resourceI, 1);
    let col = this.dataIo.getCollection(resource.collectionName);
    if (!col) { console.error(`No collection ${resource.collectionName}.`); return; }
    this.applyUpdate(resource.objects, update.update, col);
  }

  private handleInserts(insert: TaskTransformInsert) {
    let col = this.dataIo.getCollection(insert.collectionName);
    col.insert(insert.doc);
  }

  private applyUpdate(obs: Object[], update: Object, col: loki.Collection): void {

  }

}
