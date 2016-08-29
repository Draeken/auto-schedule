import { Service, Constraint } from './index';

export interface Activity {
  responsible: Service;
  name: string;
  constraints: Constraint;
}
