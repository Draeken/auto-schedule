import { Agent }              from '../agent.abstract';
import { Marker }             from '../../gears/activities.class';
import { Service, LOCAL_URL } from '../../gears/service';
import { Task }               from '../../gears/task.interface';
import { TimeHelper }         from '../../gears/time.helper';

export interface SleepConfig {
  preferedSleepTime: number;
  preferedWakeupTime: number;
}

export class SleepAgent extends Agent {
  private readonly name: string;

  constructor() {
    const name = 'sleep';
    super(name);
    this.name = name;
    const sleepConfig: SleepConfig = {
      preferedSleepTime: 22.5,
      preferedWakeupTime: 8.5
    };
    this.config.startWith(sleepConfig);
  }

  get service() {
    const service: Service = {
      url: LOCAL_URL,
      name: this.name
    };
    return service;
  }

  endTask(task: Task) {
    // todo: save task
  }

  getInfo(taskId: number): string {
    switch (taskId) {
      case 0:
        return 'Se préparer à dodosh';
      case 1:
        return 'Pas d\'écran bleu !';
    }
  }

  protected checkAllocation(context: [SleepConfig, Marker[]]): void {
    const markers = context[1];
    if (true) {
      this.requests.next([{
        id: 1,
        start: TimeHelper.relativeTime(0, 0.1),
        duration: TimeHelper.duration(5),
        minimalDuration: TimeHelper.duration(1)
      }, {
        id: 0,
        start: TimeHelper.relativeTime(0, 0.2),
        duration: TimeHelper.duration(5),
        minimalDuration: TimeHelper.duration(1)
      }]);
    }
  }

  private whenToSleep(config: SleepConfig) {
    const lastOcc = this.getLastOccurence();
  }
}
