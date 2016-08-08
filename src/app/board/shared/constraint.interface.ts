export interface ConstraintPattern {
  day?: number;
}

export interface Constraint {
  pattern?: ConstraintPattern;
  length?: number;
  date?: Date;
  when?: string | number;
}
