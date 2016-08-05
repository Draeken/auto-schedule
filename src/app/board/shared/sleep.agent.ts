import { Activity, Agent, Constraint } from './';

export class SleepAgent implements Agent {

  constructor() {
  }

  getProposals(): Constraint[] {
    let constraints: Constraint[] = [];
    const primaryConstraint: Constraint = {
      pattern: { day: 1 },
      length: 8 * 3600
    };
    constraints.push(primaryConstraint);

    return constraints;
  }

}
