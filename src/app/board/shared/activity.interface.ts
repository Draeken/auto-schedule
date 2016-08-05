import { Service } from './';

export interface Activity {
  responsible: Service;
  name: string;
  start: number;
  end: number;
}
