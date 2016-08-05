import { Activity, Constraint } from './';

export interface Agent {

  getProposals(): Constraint[];
}
