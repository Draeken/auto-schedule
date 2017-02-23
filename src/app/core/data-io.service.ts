
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ServiceQuery } from '../board/gears/service-query.interface';
import { Task,
         distinctCurrentTask,
         extractCurrentTasks } from '../board/gears/task.interface';
import { state } from './state-dispatcher.provider';
import { AppState } from '../shared/app-state.interface';

@Injectable()
export class DataIOService {

  constructor(@Inject(state) private state: Observable<AppState>) {
    this.state
      .pluck('timeline')
      .map(extractCurrentTasks)
      .distinctUntilChanged(distinctCurrentTask)
      .subscribe(this.saveCurrentTasks);
  }

  private saveCurrentTasks(tasks: Task[]): void {
    //Save to ASS
    console.log('save to ASS:', tasks);
  }

  getCurrentTasks(): Observable<ServiceQuery[]> {
    return Observable.of([]);
  }

  private retrieveFromLocalStorage(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  private saveToLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
