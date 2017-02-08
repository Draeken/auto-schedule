import { Injectable } from '@angular/core';

import { Task } from '../board/gears/task.interface';

@Injectable()
export class DataIOService {
  private readonly currentTasks = 'current-tasks';

  constructor() {}

  saveCurrentTasks(tasks: Task[]): void {
    this.saveToLocalStorage(this.currentTasks, tasks);
  }

  retrieveCurrentTasks(): Task[] {
    const currTasks = this.retrieveFromLocalStorage(this.currentTasks);
    return currTasks ? currTasks : [];
  }

  private retrieveFromLocalStorage(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  private saveToLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
