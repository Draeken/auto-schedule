import { Activity, Service } from './';

export interface Agent {
  service: Service;
  getProposals(): Activity[];
}
