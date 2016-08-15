import { Task, ServiceQuery } from './';

export class Activities {

  push(serviceName: string, q: ServiceQuery): number {
    return 0;
  }

  filter(serviceName): Activities {
    return null;
  }

  similar(activities: Activities): boolean {
    return true;
  }

  fromId(id: number): any {
    return undefined;
  }
}
