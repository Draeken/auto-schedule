import { Service }    from './service';
import { Constraint } from './constraint.interface';

export interface Activity {
  responsible: Service;
  name: string;
  constraints: Constraint;
}
