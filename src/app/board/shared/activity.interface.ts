import { Service, Constraint } from './';

export interface Activity {
  responsible: Service;
  name: string;
  constraints: Constraint;
}
