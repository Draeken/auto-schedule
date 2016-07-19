import { Injectable } from '@angular/core';

@Injectable()
export class RootService {
  private curActivity: string;

  get currentActivity() {
    return this.curActivity;
  }
  constructor() {
    this.curActivity = 'Coder.';
  }

}
