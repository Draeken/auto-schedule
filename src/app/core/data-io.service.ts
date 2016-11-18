import { Injectable } from '@angular/core';

import { Task } from '../board/gears/task.interface';

@Injectable()
export class DataIOService {
  private readonly currentTask = 'current-task';

  constructor() {}

  saveCurrentTask(task: Task): void {
    this.saveToLocalStorage(this.currentTask, task);
  }

  retrieveCurrentTask(): Task {
    return this.retrieveFromLocalStorage(this.currentTask);
  }

  private retrieveFromLocalStorage(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  private saveToLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
