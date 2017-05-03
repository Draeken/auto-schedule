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

interface RelativePos {
  timeElapsed: TimeBoundary; // Can be negative time
  kind: 'before' | 'after';
  collectionName: string;
  find: Object;
}

interface ProvideQuery {
  priority: number;
  provideTask: TaskIdentity;
  higherPriority: TaskIdentity[];
  handled: boolean;
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

export function taskIdentityToString(t: TaskIdentity): string {
  return t.agentName + '#' + t.id;
}

export function areSameTask(t1: TaskIdentity, t2: TaskIdentity): boolean {
  return t1.agentName === t2.agentName && t1.id === t2.id;
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
};
