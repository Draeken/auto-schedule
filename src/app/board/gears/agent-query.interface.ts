export interface TaskTransformNeed {
  collectionName: string,
  ref: string, //Unique ID
  find: Object,
  quantity: number,
}

export interface TaskTransformUpdate {
  ref: string,
  update: Object
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

export interface AgentQuery {
  agentName: string;
  id: number;
  start?: number;
  end?: number;
  duration?: number;
  minimalDuration: number;
  transform: TaskTransform
};
