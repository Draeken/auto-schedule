import { Task } from './';

export class Activities extends Array<Task> {

  /**
   * Pushed activities are sorted in the container
   */
  push(activity: Task): number {
    let i = this.findIndex(rangeI => rangeI.start > activity.start);
    if (i === -1) {
      return super.push(activity);
    } else {
      this.splice(i, 0, activity);
    }
    return this.length;
  }
}
