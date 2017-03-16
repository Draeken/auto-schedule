export interface TaskTransformNeed {
  collectionName: string,
  ref: string, //Unique ID
  find: Object,
  quantity: number,
}

export interface UpdateObject {
  property: string;
  value: string;
  arrayMethod?: 'Push' | 'Delete';
}

export interface TaskTransformUpdate {
  ref: string,
  update: UpdateObject[]
}

export interface TaskTransformInsert {
  collectionName: string,
  doc: Object,
}

export interface TaskTransform {
  needs: TaskTransformNeed[],
  updates: TaskTransformUpdate[],
  inserts: TaskTransformInsert[]
}

interface TimeBoundary {
  tartgetTime: number;
  min?: number;
  max?: number;
}

interface AtomicTask {
  duration?: TimeBoundary;
  start?: TimeBoundary;
  end?: TimeBoundary;
}

interface DiffuseTask {
  taskDuration: TimeBoundary;
  pauseDuration: TimeBoundary;
  totalDuration: TimeBoundary;
}

interface ObserveQuery {
  kind: 'input' | 'output';
  collectionName: string;
  find: Object;
}

interface RelativePos {
  timeElapsed: TimeBoundary; //Can be negative time
  taskId?: number;
  observe: ObserveQuery;
}

export interface AgentQuery {
  agentName: string;
  id: number;
  transform: TaskTransform;
  autoterminate: boolean;
  notifyWhenDone: boolean;
  atomic?: AtomicTask;
  diffuse?: DiffuseTask;
  relativePos?: RelativePos;
};
