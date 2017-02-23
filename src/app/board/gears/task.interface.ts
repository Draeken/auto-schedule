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
  id: number;
  serviceName: string;
  status: TaskStatus;
};

function compareTask(ta: Task, tb: Task): boolean {
  return ta.start === tb.start &&
    ta.end === tb.end &&
    ta.id === tb.id &&
    ta.serviceName === tb.serviceName &&
    ta.status === tb.status;
}

export function extractCurrentTasks(tasks: Task[]): Task[] {
  const notCurrentStatus = [TaskStatus.Sleep, TaskStatus.Done];
  return tasks.filter(t => notCurrentStatus.indexOf(t.status) === -1);
}

export function distinctCurrentTask(ta: Task[], tb: Task[]): boolean {
  let tbFiltered = extractCurrentTasks(tb);

  extractCurrentTasks(ta).forEach(t => {
    let i = tbFiltered.findIndex(tp => compareTask(t, tp));
    if (i === -1) { return false; }
    tbFiltered.splice(i, 1);
  });
  return tbFiltered.length === 0;
}
