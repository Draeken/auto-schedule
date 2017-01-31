import { Injectable } from '@angular/core';

import { Task } from '../board/gears/task.interface';

@Injectable()
export class DataIOService {
  private readonly currentTasks = 'current-tasks';
  private readonly tokenPrefix = 'token-';

  constructor() {}

  saveCurrentTasks(tasks: Task[]): void {
    this.saveToLocalStorage(this.currentTasks, tasks);
  }

  retrieveCurrentTasks(): Task[] {
    const currTasks = this.retrieveFromLocalStorage(this.currentTasks);
    return currTasks ? currTasks : [];
  }

  retrieveToken(tokenName: string): string {
    const token = this.retrieveFromLocalStorage(this.tokenPrefix + tokenName);
    return token ? token : "";
  }

  private retrieveFromLocalStorage(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  private saveToLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
