import { AppConfig } from '../../shared';
import { Activity, Task } from './';

export class ConstraintsHandler {
  private tasks: Task[] = [];

  constructor(config: AppConfig, activities: Activity[]) {
    this.buildTasks(config, activities);
  }

  private getBeginingOfDay(): number {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime() / 1000;
  }

  private buildTasks(config: AppConfig, activities: Activity[]) {
    let task: Task = {
      start: this.getBeginingOfDay(),
      end: this.getBeginingOfDay() + config.scheduleDuration
    };
    /*TODO: Check for multiple activity/service (like eat) */
  }
}
