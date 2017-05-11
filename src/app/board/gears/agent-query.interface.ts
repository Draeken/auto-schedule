export interface TaskTransformNeed {
  collectionName: string;
  ref: string; // Unique ID
  find: Object;
  quantity: number;
}

export interface UpdateObject {
  property: string;
  value: string;
  arrayMethod?: 'Push' | 'Delete';
}

export interface TaskTransformUpdate {
  ref: string;
  update: UpdateObject[];
}

export interface TaskTransformInsert {
  collectionName: string;
  doc: Object;
}

export interface TaskTransform {
  needs: TaskTransformNeed[];
  updates: TaskTransformUpdate[];
  inserts: TaskTransformInsert[];
}

export interface TimeBoundary {
  target?: number;
  min?: number;
  max?: number;
}

export interface AtomicTask {
  duration?: TimeBoundary;
  start?: TimeBoundary;
  end?: TimeBoundary;
}

export interface RelativePos {
  timeElapsed: TimeBoundary; // Can be negative time
  kind: 'before' | 'after' | 'while';
  collectionName: string;
  find: Object;
  quantity: number;
}

export interface ProvideQuery {
  priority: number;
  provideTask: TaskIdentity;
  higherPriority: TaskIdentity[];
  handled: boolean;
  constraints: LinkTask[];
}

export interface LinkTask {
  timeElapsed: TimeBoundary;
  kind: 'before' | 'after';
  taskIdentity: TaskIdentity;
}

export interface TaskIdentity {
  agentName: string;
  id: number;
}

export interface Group {
  name: string;
  constraints: LinkTask[];
  members: number[];
}


export interface AgentQuery {
  taskIdentity: TaskIdentity;
  transform: TaskTransform;
  autoterminate: boolean;
  notifyWhenDone: boolean;
  dontColide: boolean;
  atomic: AtomicTask;
  relativePos?: RelativePos;
  provide?: ProvideQuery;
  linkedToOne?: LinkTask[];
  linkedToAll?: LinkTask[];
  belongsTo?: string;
  group?: Group;
};

export function taskIdentityToString(t: TaskIdentity): string {
  return t.agentName + '#' + t.id;
}

export function areSameTask(t1: TaskIdentity, t2: TaskIdentity): boolean {
  return t1.agentName === t2.agentName && t1.id === t2.id;
}

function extractTaskIdentity(t: TaskIdentity, agentName?: string): TaskIdentity {
  if (!t) { throw 'invalid'; }
  if (agentName) {
    t.agentName = agentName;
  }
  if (typeof t.agentName !== 'string' || typeof t.id !== 'number') {
    throw 'invalid';
  }
  return t;
}

function extractLinkTask(l: LinkTask): LinkTask {
  if (!l) { return undefined; }
  return l.kind.match(/^(before|after)$/) && extractTaskIdentity(l.taskIdentity) && typeof l.timeElapsed === 'number' ? l : undefined;
}

function extractTransform(t: TaskTransform): TaskTransform {
  if (!t) { throw 'invalid'; }
  const transform: TaskTransform = { inserts: [], needs: [], updates: [] };
  if (t.inserts) {
    transform.inserts = extractArray(t.inserts, (i: TaskTransformInsert) =>
      typeof i.collectionName === 'string' && i.doc !== undefined);
  }
  if (t.needs) {
    transform.needs = extractArray(t.needs, (n: TaskTransformNeed) =>
      typeof n.collectionName === 'string' && n.find !== undefined && typeof n.quantity === 'number' &&
      typeof n.ref === 'string');
  }
  if (t.updates) {
    transform.updates = extractArray(t.updates, (u: TaskTransformUpdate) =>
      typeof u.ref === 'string' && transform.needs.findIndex(n => n.ref === u.ref) !== -1 &&
      u.update !== undefined);
  }
  return transform;
}

function extractArray(a: any[], fn: (any) => boolean): any[] {
  let array = a;
  if (!Array.isArray(a)) { array = [a]; }
  if (!array.every(fn)) { throw 'invalid'; }
  return array;
}

function extractRelativPos(r: RelativePos): RelativePos {
  if (!r) { return undefined; }
  if (typeof r.collectionName === 'string' &&
    r.find !== undefined && typeof r.quantity === 'number' &&
    typeof r.timeElapsed === 'number' && r.kind.match(/^(before|while|after)$/)) {
      return r;
  }
  throw 'invalid';
}

function extractProviderQuery(p: ProvideQuery): ProvideQuery {
  if (!p) { return undefined; }
  const constraints = p.constraints ? extractArray(p.constraints, (l: LinkTask) => extractLinkTask(l) !== undefined) : undefined;
  const provideTask = extractTaskIdentity(p.provideTask);
  if (!constraints || !provideTask || p.priority === undefined) { throw 'invalid'; }
  return {
    constraints: constraints,
    handled: false,
    higherPriority: [],
    priority: p.priority,
    provideTask: provideTask
  };
}

function extractPrimitive(o: any, type: string): any {
  if (o === undefined) { return undefined; }
  if (!(typeof o === type)) { throw 'invalid'; }
  return o;
}

function extractGroup(g: Group): Group {
  if (!g) { return undefined; }
  extractArray(g.constraints, (l: LinkTask) => extractLinkTask(l) !== undefined);
  extractArray(g.members, (n: number) => typeof n === 'number');
  if (typeof g.name !== 'string') { throw 'invalid'; }
  return g;
}

export function objToAgentQuery(o: AgentQuery, agentName: string): AgentQuery {
  try {
    const atomic = o.atomic;
    if (!atomic) { return undefined; }
    const taskIdentity = extractTaskIdentity(o.taskIdentity, agentName);
    const transform = extractTransform(o.transform);
    const autoTerminate = o.autoterminate !== undefined ? o.autoterminate : true;
    const notifyWhenDone = o.notifyWhenDone !== undefined ? o.notifyWhenDone : false;
    const dontColide = o.dontColide !== undefined ? o.dontColide : false;
    const relativePos = extractRelativPos(o.relativePos);
    const provideQuery = extractProviderQuery(o.provide);
    const linkedToOne = o.linkedToOne ? extractArray(o.linkedToOne, (l: LinkTask) => extractLinkTask !== undefined) : undefined;
    const linkedToAll = o.linkedToAll ? extractArray(o.linkedToAll, (l: LinkTask) => extractLinkTask !== undefined) : undefined;
    const belongsTo = extractPrimitive(o.belongsTo, 'string');
    const group = extractGroup(o.group);

    return {
      taskIdentity: taskIdentity,
      transform: transform,
      atomic: atomic,
      autoterminate: autoTerminate,
      belongsTo: belongsTo,
      dontColide: dontColide,
      group: group,
      linkedToAll: linkedToAll,
      linkedToOne: linkedToOne,
      notifyWhenDone: notifyWhenDone,
      provide: provideQuery,
      relativePos: relativePos
    };
  } catch (e) { return undefined; }
}
