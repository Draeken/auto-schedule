export class TaskCreation {
  constructor(
    public name: string,
    public hourRestriction: string,
    public weekdayRestriction: string,
    public dayRestriction: string,
    public weekdayInMonthRestriction: string,
    public monthRestriction: string,
    public reccPart0: number,
    public reccPart1: boolean,
    public reccPart2: number,
    public reccPart3: string,
    public dueDate: Date,
    public timeEstimation: number,
    public minTime: number,
    public maxTime: number,
    public minPause: number,
    public maxPause: number,
    public eligibleForSimult: boolean,
    public relativeToOther: string
  ) {}
}
