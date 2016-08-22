export class TimeHelper {

  static nextTime(hours: number, minutes: number): number {
    let dateBase = new Date();
    let nextDate = new Date();
    nextDate.setHours(hours, minutes);
    if (nextDate > dateBase) {
      return nextDate.getTime();
    }
    return nextDate.setDate(nextDate.getDate() + 1);
  }

  static duration(hours: number, minutes = 0): number {
    return hours * 3600000 + minutes * 60000;
  }

}
