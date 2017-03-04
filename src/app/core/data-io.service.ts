
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ServiceQuery } from '../board/gears/service-query.interface';
import { Task,
         distinctCurrentTask,
         extractCurrentTasks } from '../board/gears/task.interface';
import { timelineState } from './timeline-state/state-dispatcher.provider';
import { TimelineState } from '../core/timeline-state/timeline-state.interface';

@Injectable()
export class DataIOService {
  private loki: loki;

  constructor(@Inject(timelineState) private tlState: Observable<TimelineState>) {
    this.tlState
      .pluck('timeline')
      .map(extractCurrentTasks)
      .distinctUntilChanged(distinctCurrentTask)
      .subscribe(this.saveCurrentTasks);

    this.loki = new loki('resources.db', {
      verbose: true,
      autosave: false,
      autoload: true,
      throttledSaves: false,
    });
  }

  getCurrentTasks(): Observable<ServiceQuery[]> {
    return Observable.of([]);
  }

  getCollection(name: string): loki.Collection {
    return this.loki.getCollection(name);
  }

  private saveCurrentTasks(tasks: Task[]): void {
    //Save to ASS
    console.log('save to ASS:', tasks);
  }

  private retrieveFromLocalStorage(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  private saveToLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
