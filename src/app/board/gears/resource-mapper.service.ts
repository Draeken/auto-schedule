import { Injectable,
         Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AgentService } from './agent.service';
import { DataIOService } from '../../core/data-io.service';
import { timelineState } from '../../core/timeline-state/state-dispatcher.provider';
import { TimelineState} from '../../core/timeline-state/timeline-state.interface';
import { Task,
         TaskHelper } from './task.interface';
import { UpdateObject,
         TaskTransform,
         TaskTransformNeed,
         TaskTransformUpdate,
         TaskTransformInsert,
         TaskIdentity,
         RelativePos,
         AgentQuery } from './agent-query.interface';
import { Agent } from '../agents/agent.abstract';
import { Permission } from '../agents/permissions.class';
import { Bound } from './timeline/optimal-placement.function';
import { Placement } from './timeline/placement.class';

interface Resource {
  docs: loki.Doc[];
  ref: string;
  collectionName: string;
}

export interface RequestToAgent {
  need: TaskTransformNeed;
  targetTime: number;
  taskId: string;
  serviceName: string;
  context: loki.Doc[];
}

interface UpdateRequest {
  docs: loki.Doc[];
  update: UpdateObject[];
}

export interface TransformResult {
  inserted: loki.Collection;
  updated: loki.Collection;
  deleted: loki.Collection;
  updateRequest: UpdateRequest[];
}

interface IProviderManager {
  task(t: Task): void;
  isValid(): boolean;
  pushNeed(need: TaskTransformNeed): void;
  askProviders(): void;
}

class ProviderManager implements IProviderManager {
  private agentRequestMap = new Map<Agent, RequestToAgent[]>();
  private currentTask: Task;
  private _isValid = true;

  constructor(private agents: Agent[], private dataIo: DataIOService) {
    agents.forEach(agent => this.agentRequestMap.set(agent, []));
  }

  task(task: Task) { this.currentTask = task; }
  isValid(): boolean { return this._isValid; }

  pushNeed(need: TaskTransformNeed): void {
    this.agentRequestMap.forEach((requests, agent) => {
      if (!agent.canProvide(need.collectionName)) { return; }
      requests.push({
        need: need,
        targetTime: this.currentTask.start,
        taskId: this.currentTask.query.taskIdentity.id,
        serviceName: this.currentTask.query.taskIdentity.agentName,
        context: this.getContext(agent)
      });
    });
    this._isValid = false;
    this.pushNeedForRequester(need);
  }

  private pushNeedForRequester(need: TaskTransformNeed): void {
    const agent = this.agents.find(a => a.service.name === this.currentTask.query.taskIdentity.agentName);
    this.agentRequestMap.get(agent).push({
      need: need,
      targetTime: this.currentTask.start,
      taskId: this.currentTask.query.taskIdentity.id,
      serviceName: agent.service.name,
      context: null
    });
  }

  askProviders(): void {
    this.agentRequestMap.forEach((req, a) => a.askToProvide(req));
  }

  private getContext(agent: Agent): loki.Doc[] {
    const agentPerm = agent.service.userPermission;
    const queries = new Map<string, Object[]>();

    // Maybe use empty array instead of {}
    agentPerm.getCollectionsWith(Permission.Context).forEach(c => queries.set(c, [{}]));
    agentPerm.getDocumentsWith(Permission.Context).forEach((docs, collName) => {
      queries.set(collName, docs);
    });
    return this.executeQueries(queries);
  }

  private executeQueries(queriesMap: Map<string, Object[]>): loki.Doc[] {
    const results = [];
    queriesMap.forEach((queries, collName) => {
      const coll = this.dataIo.getCollection(collName);
      queries.forEach(q => results.concat(coll.find(q)));
    });
    return results;
  }
}

class DummyProviderManager implements IProviderManager {
  constructor() {}
  task(t: Task) {}
  isValid(): boolean { return true; }
  pushNeed(n: TaskTransformNeed): void {}
  askProviders(): void {}
}

interface SatisfactionRecord {
  satisfaction: number;
  providerIdent: TaskIdentity;
}

interface SatisfactionNeed {
  satisfaction: number;
  quantity: number;
  ref: string;
}

class ProviderLinkerManager implements IProviderManager {
  private currentTask: Task;
  private _isValid = true;
  private firstTime = true;
  private clientNeeds: TaskTransformNeed[] = [];
  private clientNeedsAfterProvide: TaskTransformNeed[] = [];
  private satisRecord: Map<string, SatisfactionRecord[]> = new Map();
  private providerOrder: AgentQuery[] = [];

  constructor(private dataIo:  DataIOService) {}

  get topProvider(): AgentQuery[] {
    return this.providerOrder.filter(p => p.provide.higherPriority.length === 0);
  }

  task(task: Task) { this.currentTask = task; }
  isValid(): boolean { return this._isValid; }

  pushNeed(need: TaskTransformNeed): void {
    if (this.firstTime && this.currentTask.start === 1) {
      this.clientNeeds.push(need);
    } else {
      this.firstTime = false;
    }
    if (this.currentTask.start === 0) { return; }
    this.clientNeedsAfterProvide.push(need);
  }

  updateProvideSatis(provider: AgentQuery): void {
    const satisfiedNeeds = this.computeSatisfiedNeeds(provider);
    if (!satisfiedNeeds.length) {
      console.warn(`Obsolete provider ${provider}`);
      // TODO: Obsolete. Ask provider to remove this task
      return;
    }
    const higherPriority: Set<TaskIdentity> = new Set();
    satisfiedNeeds.forEach(this.handleSatisfiedNeed.bind(this, higherPriority, provider));
    provider.provide.higherPriority.push(...higherPriority.values());
    this.clientNeedsAfterProvide = [];
  }

  private handleSatisfiedNeed(highP: Set<TaskIdentity>, provider: AgentQuery, need: SatisfactionNeed) {
    const newRecord = { satisfaction: need.satisfaction, providerIdent: provider.taskIdentity };
    if (!this.satisRecord.has(need.ref)) {
      this.satisRecord.set(need.ref, [newRecord]);
      return;
    }
    const record = this.satisRecord.get(need.ref);
    record.map(r => r.providerIdent).forEach(highP.add);
    record.push(newRecord);
  }

  private computeSatisfiedNeeds(provider: AgentQuery): SatisfactionNeed[] {
    let incompatibleMark = false;
    const satisfiedNeeds: SatisfactionNeed[] = this.clientNeeds.map(n => ({ satisfaction: 1, quantity: n.quantity, ref: n.ref }));
    this.clientNeedsAfterProvide.forEach(need => {
      const i = satisfiedNeeds.findIndex(s => s.ref === need.ref);
      if (i === -1) {
        incompatibleMark = true;
        return;
      }
      const satis = 1 - need.quantity / satisfiedNeeds[i].quantity;
      if (satis === 0) {
        satisfiedNeeds.splice(i, 1);
      } else {
        satisfiedNeeds[i].satisfaction = satis;
      }
    });
    if (incompatibleMark) {
      this.providerOrder.unshift(provider);
    } else {
      this.providerOrder.push(provider);
    }
    return satisfiedNeeds;
  }

  askProviders(): void {}

}

@Injectable()
export class ResourceMapperService {
  private transformCollections: Observable<Map<string, TransformResult>>;

  constructor(@Inject(timelineState) private tlState: Observable<TimelineState>,
              private delivery: AgentService,
              private dataIo: DataIOService) {
    this.handleTimelineChange(this.tlState.pluck('timeline'));
  }

  get transformCollObs(): Observable<Map<string, TransformResult>> {
    return this.transformCollections;
  }

  updateTimeline(t: Task[], agents: Agent[]): Task[] {
    const isValid = this.parseActivities(t, new ProviderManager(agents, this.dataIo));
    this.dataIo.resetLoki();
    return isValid ? t : undefined;
  }

  getMatchingArea(timeline: Placement[], query: AgentQuery, min: number, max: number): Bound[] {
    const serializedState = this.dataIo.serializeLoki();
    const relativ = query.relativePos;
    const dummyPM = new DummyProviderManager();
    const colName = relativ.collectionName;
    const bounds: Bound[] = [];
    const minimalTime = query.atomic.duration.min;
    let start = max;

    if (this.docQuantityMatch(colName, relativ.find, relativ.quantity)) {
      start = min;
    }
    timeline.map(this.placementToTask).forEach(task => {
      this.parseActivities([task], dummyPM);
      if (!this.docQuantityMatch(colName, relativ.find, relativ.quantity)) {
        if (task.start - start < minimalTime) { return; }
        bounds.push({ start: start, end: task.start });
        start = task.end;
      }
    });

    if (max - start >= minimalTime) {
      bounds.push({ start: start, end: max });
    }

    this.dataIo.deserializeLoki(serializedState);

    return bounds;
  }

  placementToTask(placement: Placement): Task {
    return {
      start: placement.start,
      end: placement.end,
      query: placement.query,
      status: 0
    };
  }

  docQuantityMatch(colName: string, find: Object, quantity: number): boolean {
    const col = this.dataIo.getCollection(colName);
    if (!col) { return false; }
    const docs = col.find(find);
    return docs.length >= quantity;
  }

  handleProviders(placedQueries: AgentQuery[], allQueries: AgentQuery[]): void {
    const map = this.computeProviderMap(placedQueries, allQueries);
    const dummyPM = new DummyProviderManager();

    placedQueries.forEach((clientQuery, i) => {
      const clientTask = this.queryToTask(clientQuery, 1);
      if (!map.has(i)) {
        this.parseActivities([clientTask], dummyPM);
        return;
      }
      const providerLinker = new ProviderLinkerManager(this.dataIo);
      const serializedState = this.dataIo.serializeLoki();

      this.parseActivities([clientTask], providerLinker);
      this.dataIo.deserializeLoki(serializedState);
      map.get(i).sort((p1, p2) => p2.provide.priority - p1.provide.priority).forEach(provider => {
        this.parseActivities([this.queryToTask(provider), clientTask], providerLinker);
        providerLinker.updateProvideSatis(provider);
        this.dataIo.deserializeLoki(serializedState);
        provider.provide.handled = true;
      });
      const topProvider = providerLinker.topProvider;
      this.linkTopProviders(topProvider);
      this.parseActivities([...topProvider.map(q => this.queryToTask(q)), clientTask], dummyPM);
    });
  }

  private linkTopProviders(provider: AgentQuery[]): void {
    let prevProv = provider[0];
    for (let i = 1; i < provider.length; ++i) {
      const currProv = provider[i];
      prevProv.provide.constraints.push({
        timeElapsed: {
          max: 0,
          min: -Infinity
        },
        kind: 'before',
        taskIdentity: currProv.taskIdentity
      });
      prevProv = currProv;
    }
  }

  private computeProviderMap(placedQueries: AgentQuery[], allQueries: AgentQuery[]): Map<number, AgentQuery[]> {
    const map: Map<number, AgentQuery[]> = new Map();
    allQueries.filter(q => q.provide !== undefined && !q.provide.handled).forEach(q => {
      const clientQueryI = placedQueries.findIndex(cq => cq.taskIdentity.agentName === q.provide.provideTask.agentName
        && cq.taskIdentity.id === q.provide.provideTask.id);
      if (clientQueryI === -1) { return; }
      if (!map.has(clientQueryI)) { map.set(clientQueryI, []); }
      map.get(clientQueryI).push(q);
    });
    return map;
  }

  private queryToTask(query: AgentQuery, offset: number = 0): Task {
    return {
      start: offset,
      end: offset,
      status: 0,
      query: query
    };
  }

  private handleTimelineChange(timeline: Observable<Task[]>): void {
    this.transformCollections = timeline
      .map(TaskHelper.extractLastDone)
      .filter(t => t !== undefined)
      .distinctUntilChanged()
      .map(task => task.query.transform)
      .map(this.transToColl.bind(this));

    this.delivery.registerTransformColl(this.transformCollObs);
    this.transformCollections.subscribe(this.updateUserState.bind(this), v => console.error('error:', v));
  }

  private updateUserState(map: Map<string, TransformResult>): void {
    map.forEach((tr, collName) => {
      const col = this.dataIo.getCollection(collName, true);
      col.remove(tr.deleted.find({}));
      col.insert(tr.inserted.find({}));
      tr.updateRequest.forEach(ur => {
        this.applyUpdate(ur.docs, ur.update, col);
      });
    });
    this.dataIo.saveLoki();
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
    const map = new Map<string, TransformResult>();
    const resources: Resource[] = [];

    transform.inserts.forEach(insert => {
      this.ensureInit(map, insert.collectionName);
      map.get(insert.collectionName).inserted.insert(insert.doc);
    });

    transform.needs.forEach(need => {
      const colName = need.collectionName;
      const objs = this.dataIo.findDocs(colName, need.find, need.quantity);
      resources.push({
        docs: objs,
        ref: need.ref,
        collectionName: colName
      });
    });
    transform.updates.forEach(update => {
      const i = resources.findIndex(r => r.ref === update.ref);
      const resource: Resource = resources.splice(i, 1)[0];
      const colName = resource.collectionName;
      this.ensureInit(map, colName);
      const transRes = map.get(colName);
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

  private parseActivities(tasks: Task[], providerManager: IProviderManager): boolean {
    tasks.forEach(task => {
      const resources: Resource[] = [];
      const transform = task.query.transform;
      providerManager.task(task);
      transform.needs.forEach(this.handleNeeds.bind(this, resources, providerManager));
      transform.updates.forEach(this.handleUpdates.bind(this, resources));
      transform.inserts.forEach(this.handleInserts);

      resources.forEach(resource => {
        const col = this.dataIo.getCollection(resource.collectionName);
        resource.docs.forEach(obj => col.remove(obj));
      });
    });
    providerManager.askProviders();
    return providerManager.isValid();
  }

  private handleNeeds(resources: Resource[], providerManager: IProviderManager, need: TaskTransformNeed) {
    const col = this.dataIo.getCollection(need.collectionName);
    if (!col) {
      console.error(`Collection ${need.collectionName} doesn't exist.`);
      providerManager.pushNeed(need);
      return;
    }
    const objs = col.find(need.find);
    if (objs.length < need.quantity) {
      const updatedNeed = Object.assign({}, need);
      updatedNeed.quantity = need.quantity - objs.length;
      providerManager.pushNeed(updatedNeed);
      return;
    }
    resources.push({ docs: objs.slice(0, need.quantity), ref: need.ref, collectionName: need.collectionName });
  }

  private handleUpdates(resources: Resource[], update: TaskTransformUpdate) {
    const resourceI = resources.findIndex(r => r.ref === update.ref);
    const resource = resources[resourceI];
    resources.splice(resourceI, 1);
    const col = this.dataIo.getCollection(resource.collectionName);
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

  private applyUpdate(obs: loki.Doc[], updates: UpdateObject[], col: loki.Collection): void {
    const updatedObs = obs.map(o => {
      updates.forEach(update => {
        if (update.arrayMethod !== undefined) {
          if (update.arrayMethod === 'Push') {
            (<Array<any>>o[update.property]).push(update.value);
            return;
          } else if (update.arrayMethod === 'Delete') {
            const arr = <Array<any>>o[update.property];
            const i = arr.findIndex(value => value === update.value);
            if (i !== -1) { arr.splice(i, 1); }
            return;
          }
        }
        o[update.property] = update.value;
      });
      return o;
    });
    col.update(updatedObs);
  }

}
