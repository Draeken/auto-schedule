import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Marker, MarkerKind } from './timeline.class';
import { AgentQuery, TimeBoundary } from '../agent-query.interface';

interface Point {
  x: number;
  y: number;
}

export enum MoveKind {
  Start,
  End
}

export class Placement {
  private _start: number;
  private _end: number;
  private _isNew = true;
  private _satisfaction = 0;
  readonly query: AgentQuery;
  readonly startMarker: Marker;
  readonly endMarker: Marker;

  constructor(start: Marker, end: Marker, query: AgentQuery) {
    this.startMarker = start;
    this.endMarker = end;
    this.query = query;
  }

  get satisfaction() {
    return this._satisfaction;
  }

  get isNew() {
    return this._isNew;
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }

  updatePos(m: MoveKind, value: number): number {
    if (m === MoveKind.Start) {
      return this.setStart(value);
    } else {
      return this.setEnd(value);
    }
  }

  setStartEnd(start: number, end: number): number {
    this._start = start;
    this._end = end;
    return this.computeAndUpdateSatisfaction(MarkerKind.Both);
  }

  setStart(start: number): number {
    this._start = start;
    return this.computeAndUpdateSatisfaction(MarkerKind.Start);
  }

  setEnd(end: number): number {
    this._end = end;
    return this.computeAndUpdateSatisfaction(MarkerKind.End);
  }

  private computeAndUpdateSatisfaction(kind: MarkerKind): number {
    let satisfaction = this.computeLengthSatisfaction();

    if (kind === MarkerKind.Start || kind === MarkerKind.Both) {
      satisfaction *= this.computeSatisfaction(this.startMarker, this._start);
    }
    if (kind === MarkerKind.End || kind === MarkerKind.Both) {
      satisfaction *= this.computeSatisfaction(this.endMarker, this._end);
    }

    this._satisfaction = satisfaction;
    this._isNew = false;
    return satisfaction;
  }

  private computeLengthSatisfaction(): number {
    const duration = this.query.atomic ?
      this.query.atomic.duration : this.query.diffuse ?
        this.query.diffuse.taskDuration : undefined;

    if (!duration) { return 1; }

    return this.computeImageFromTimeBoundary(duration, this._end - this._start, 1);
  }

  private computeSatisfaction(marker: Marker, pos: number) {
    const t = marker.time;
    if (!t.target) {
      return pos >= t.min && pos <= t.max ? marker.satisfaction : 0;
    }
    if (t.target === pos) { return marker.satisfaction; };
    this.computeImageFromTimeBoundary(t, pos, marker.satisfaction);
  }

  private computeImageFromTimeBoundary(t: TimeBoundary, pos: number, satis: number) {
    return t.target < pos ?
      this.computeImage({ x: t.target, y: satis }, { x: t.max, y: 0 }, pos) :
      this.computeImage({ x: t.min, y: 0 }, { x: t.target, y: satis }, pos);
  }

  private computeImage(p1: Point, p2: Point, pos: number): number {
    const a = (p2.x - p1.x) / (p2.y - p1.y);
    return (pos - p1.x) * a;
  }
};
