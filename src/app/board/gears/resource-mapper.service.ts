import { Injectable,
         Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AgentService }   from './agent.service';
import { DataIOService }  from '../../core/data-io.service';
import { timelineState }  from '../../core/timeline-state/state-dispatcher.provider';
import { TimelineState}   from '../../core/timeline-state/timeline-state.interface';
import { Task,
         TaskHelper } from './task.interface';
import { TaskTransform,
         TaskTransformNeed,
         TaskTransformUpdate,
         TaskTransformInsert }  from './agent-query.interface';
import { Agent }  from '../agents/agent.abstract';
import { Permission }  from '../agents/permissions.class';

interface Resource {
  docs: loki.Doc[];
  ref: string;
  collectionName: string;
}

interface RequestToAgent {
  need: TaskTransformNeed;
  targetTime: number;
  taskId: number;
  serviceName: string;
  context: loki.Doc[];
}

interface UpdateRequest {
  docs: loki.Doc[];
  update: Object;
}

interface UpdateRequestAgent {
  ids: number[];
  update: Object;
}

interface TransformResultAgent {
  inserted: loki.Doc[];
  updateRequest: UpdateRequestAgent[];
  deleted: number[];
}

interface TransformResult {
  inserted: loki.Collection;
  updated: loki.Collection;
  deleted: loki.Collection;
  updateRequest: UpdateRequest[];
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
        taskId: this.currentTask.query.id,
        serviceName: this.currentTask.query.agentName,
        context: this.getContext(agent)
      });
    })
    this._isValid = false;
  }

  private getContext(agent: Agent): loki.Doc[] {
    let context;
    let agentPerm = agent.service.userPermission;
    let queries = new Map<string, Object[]>();

    //Maybe use empty array instead of {}
    agentPerm.getCollectionsWith(Permission.Context).forEach(c => queries.set(c, [{}]));
    agentPerm.getDocumentsWith(Permission.Context).forEach((docs, collName) => {
      queries.set(collName, docs);
    });
    return this.executeQueries(queries);
  }

  private executeQueries(queriesMap: Map<string, Object[]>): loki.Doc[] {
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

  constructor(@Inject(timelineState) private tlState: Observable<TimelineState>,
              private delivery: AgentService,
              private dataIo: DataIOService) {
    this.handleTimelineChange(this.tlState.pluck('timeline'));
  }

  private handleTimelineChange(timeline: Observable<Task[]>): void {
    timeline
      .map(TaskHelper.extractLastDone)
      .filter(t => t !== undefined)
      .distinctUntilChanged()
      .withLatestFrom(this.delivery.agents)
      .subscribe(this.handleDoneTask.bind(this));
  }

  private handleDoneTask(context: [Task, Agent[]]): void {
    let task = context[0];
    let agents = context[1];

    //If task has "Notice when done" flag, notice agent.
    let map = this.transToColl(task.query.transform);
    this.notifyAgents(agents, map);

    //Save changes to loki
  }

  private notifyAgents(agents: Agent[], map: Map<string, TransformResult>): void {
    agents.forEach(agent => {
      let notifyLoad: any = {};
      agent.service.userPermission.getCollectionsWith(Permission.Watch).forEach(c => {
        notifyLoad[c] = this.mapTransResultForAgent(map.get(c), [{}]);
      });
      agent.service.userPermission.getDocumentsWith(Permission.Watch).forEach((docs, collName) => {
        notifyLoad[collName] = this.mapTransResultForAgent(map.get(collName), docs);
      });
      agent.notifyStateChange(notifyLoad);
    })
  }

  private mapTransResultForAgent(tr: TransformResult, docDescs: Object[]): TransformResultAgent {
    let createSet = (collection: loki.Collection) => {
      let set = new Set<loki.Doc>();
      docDescs.forEach(docDesc => collection.find(docDesc).forEach(doc => set.add(doc)))
      return set;
    }
    let updates = createSet(tr.updated);
    let updateRequest: UpdateRequestAgent[];
    let inserted = createSet(tr.inserted);
    let deleted = createSet(tr.deleted);

    tr.updateRequest.forEach(ur => {
      let docsIds = ur.docs.filter(doc => {
        if (!updates.has(doc)) {
          return false;
        };
        updates.delete(doc);
        return true;
      }).map(d => d.$loki);

      if (docsIds.length === 0) { return; }
      updateRequest.push({
        ids: docsIds,
        update: ur.update
      });
    });
    return {
      inserted: [...inserted.values()],
      updateRequest: updateRequest,
      deleted: [...deleted.values()].map((dt: loki.Doc) => dt.$loki)
    };
  }

  private ensureInit(map: Map<string, TransformResult>, key: string): Map<string, TransformResult> {
    if (map.has(key)) { return map; }
    map.set(key, {
      inserted: this.dataIo.getAnonCollection(),
      updated: this.dataIo.getAnonCollection(),
      deleted: this.dataIo.getAnonCollection(),
      updateRequest: []
    });
    return map;
  }

  private transToColl(transform: TaskTransform): Map<string, TransformResult> {
    let map = new Map<string, TransformResult>();
    let resources: Resource[] = [];

    transform.inserts.forEach(insert => {
      this.ensureInit(map, insert.collectionName);
      map.get(insert.collectionName).inserted.insert(insert.doc);
    });

    transform.needs.forEach(need => {
      let colName = need.collectionName;
      let objs = this.dataIo.findDocs(colName, need.find, need.quantity)
      resources.push({
        docs: objs,
        ref: need.ref,
        collectionName: colName
      });
    });
    transform.updates.forEach(update => {
      let i = resources.findIndex(r => r.ref === update.ref);
      let resource: Resource = resources.splice(i, 1)[0];
      let colName = resource.collectionName;
      this.ensureInit(map, colName);
      let transRes = map.get(colName);
      transRes.updated.insert(resource.docs);
      transRes.updateRequest.push({
        docs: resource.docs,
        update: update.update
      });
    });
    resources.forEach(deleted => {
      this.ensureInit(map, deleted.collectionName);
      map.get(deleted.collectionName).deleted.insert(deleted.docs);
    });

    return map;
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
      let transform = task.query.transform;
      providerManager.task = task;
      transform.needs.forEach(this.handleNeeds.bind(this, resources, providerManager));
      transform.updates.forEach(this.handleUpdates.bind(this, resources));
      transform.inserts.forEach(this.handleInserts);

      resources.forEach(resource => {
        let col = this.dataIo.getCollection(resource.collectionName);
        resource.docs.forEach(obj => col.remove(obj));
      });
    });
    //providerManager -> send requests to agents
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
    resources.push({ docs: objs.slice(0, need.quantity), ref: need.ref, collectionName: need.collectionName });
  }

  private handleUpdates(resources: Resource[], update: TaskTransformUpdate) {
    let resourceI = resources.findIndex(r => r.ref === update.ref);
    let resource = resources[resourceI];
    resources.splice(resourceI, 1);
    let col = this.dataIo.getCollection(resource.collectionName);
    if (!col) { console.error(`No collection ${resource.collectionName}.`); return; }
    this.applyUpdate(resource.docs, update.update, col);
  }

  private handleInserts(insert: TaskTransformInsert) {
    let col = this.dataIo.getCollection(insert.collectionName);
    if (!col) {
      col = this.dataIo.addCollection(insert.collectionName);
    }
    col.insert(insert.doc);
  }

  private applyUpdate(obs: Object[], update: Object, col: loki.Collection): void {

  }

}
