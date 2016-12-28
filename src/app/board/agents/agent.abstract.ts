import { Observable, Subject } from 'rxjs';

import { Marker }       from '../gears/activities.class';
import { Service }      from '../gears/service';
import { ServiceQuery } from '../gears/service-query.interface';
import { Task }         from '../gears/task.interface';
import { Occurence }    from './occurence.interface';
import { QuickAction }  from './quick-action.interface'

export abstract class Agent {
  service: Service;
  quickActions: QuickAction[] = [];

  protected config: Subject<any>;
  protected requests: Subject<ServiceQuery[]>;

  private readonly lsPrefix: string;
  private readonly lsOccurenceKey = 'occurences';

  constructor(name: string) {
    this.config = new Subject<any>();
    this.lsPrefix = name;
    this.quickActions.push({
      name: "Config",
      url: name + "config"
    });
  }

  abstract getInfo(taskId: number): string

  abstract endTask(task: Task): void

  protected abstract checkAllocation(context: [any, Marker[]]): void

  setComponentRegistration(obs: Observable<any>): void {
    obs.subscribe(this.config);
  }

  setConductorRegistration(allocation: Observable<Marker[]>,
                           requests: Subject<ServiceQuery[]>): void {
    this.requests = requests;
    this.config.combineLatest(allocation).subscribe(this.checkAllocation);
    this.checkAllocation([null, []]);
  }

  protected getOccurences(): Occurence[] {
    const occ: Occurence[] = JSON.parse(localStorage.getItem(this.lsPrefix + this.lsOccurenceKey));
    return occ ? occ : [];
  }

  protected getLastOccurence(): Occurence {
    const occ = this.getOccurences();
    return occ.length ? occ[occ.length - 1] : null;
  }

  protected saveOccurence(task: Task) {
    let occ = this.getOccurences();
    occ.push({
      start: task.start,
      end: task.end,
      id: task.id
    });
    localStorage.setItem(this.lsPrefix + this.lsOccurenceKey, JSON.stringify(occ));
  }
}
