export class TimeHelper {
  static fromHours(hours, minutes): number {
    return hours + minutes / 60;
  }
}
