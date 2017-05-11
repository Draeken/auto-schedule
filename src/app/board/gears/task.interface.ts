import { AgentQuery } from './agent-query.interface';

export enum TaskStatus {
  Running,
  Done,
  Paused,
  Extended,
  Sleep
}

export interface Task {
  start: number;
  end: number;
  status: TaskStatus;
  query: AgentQuery;
};

export class TaskHelper {

  static extractLastDone(tasks: Task[]): Task {
    for (let i = tasks.length - 1; i >= 0; ++i) {
      if (tasks[i].status === TaskStatus.Done) { return tasks[i]; }
    }
  }

  static extractCurrent(tasks: Task[]): Task[] {
    const notCurrentStatus = [TaskStatus.Sleep, TaskStatus.Done];
    return tasks.filter(t => notCurrentStatus.indexOf(t.status) === -1);
  }

  static extractNext(tasks: Task[]): Task[] {
    let i = tasks.findIndex(t => t.status === TaskStatus.Sleep);
    if (i === -1) { return []; }
    const nextTasks = [tasks[i]];
    let nextEnd = nextTasks[0].end;
    do {
      const nextTask = tasks[++i];
      if (nextTask.start > nextEnd) { break; }
      nextTasks.push(nextTask);
      nextEnd = Math.min(nextEnd, nextTask.end);
    } while (i < tasks.length);
    return nextTasks;
  }

  static distinct(ta: Task[], tb: Task[]): boolean {
    const tbCopy = [].concat(tb);
    ta.forEach(t => {
      const i = tbCopy.findIndex(tp => t === tp);
      if (i === -1) { return; }
      tbCopy.splice(i, 1);
    });
    return tbCopy.length === 0;
  }

  static distinctCurrent(ta: Task[], tb: Task[]): boolean {
    const tbFiltered = TaskHelper.extractCurrent(tb);

    TaskHelper.extractCurrent(ta).forEach(t => {
      const i = tbFiltered.findIndex(tp => t === tp);
      if (i === -1) { return; }
      tbFiltered.splice(i, 1);
    });
    return tbFiltered.length === 0;
  }

}
