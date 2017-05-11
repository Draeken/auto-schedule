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
  private _startSatis = 0;
  private _endSatis = 0;
  private _lengthSatis = 0;
  readonly query: AgentQuery;
  readonly startMarker: Marker;
  readonly endMarker: Marker;

  constructor(query: AgentQuery, start: Marker, end: Marker) {
    this.startMarker = start;
    this.endMarker = end;
    this.query = query;
    this.initPlacement();
  }

  getMarker(m: MoveKind): Marker {
    switch (m) {
      case MoveKind.Start:
        return this.startMarker;
      case MoveKind.End:
        return this.endMarker;
    }
  }

  getPosition(m: MoveKind): number {
    switch (m) {
      case MoveKind.Start:
        return this._start;
      case MoveKind.End:
        return this._end;
    }
  }

  get satisfaction(): number {
    return this._startSatis * this._lengthSatis * this._endSatis;
  }

  get additiveSat(): number {
    return this._startSatis + this._lengthSatis + this._endSatis;
  }

  get isNew(): boolean {
    return this._isNew;
  }

  get start(): number {
    return this._start;
  }

  get end(): number {
    return this._end;
  }

  clone(): Placement {
    const p = new Placement(this.query, this.startMarker, this.endMarker);
    p._start = this._start;
    p._end = this._end;
    p._startSatis = this._startSatis;
    p._endSatis = this._endSatis;
    p._lengthSatis = this._lengthSatis;
    return p;
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

  setStart(start: number, keepLengthGreater = 0): number {
    this._start = start;
    if (this._end < this._start) {
      this._end = this._start + keepLengthGreater;
      return this.computeAndUpdateSatisfaction(MarkerKind.Both);
    }
    return this.computeAndUpdateSatisfaction(MarkerKind.Start);
  }

  setEnd(end: number, keepLengthGreater = 0): number {
    this._end = end;
    if (this._start > this._end) {
      this._start = this._end - keepLengthGreater;
      return this.computeAndUpdateSatisfaction(MarkerKind.Both);
    }
    return this.computeAndUpdateSatisfaction(MarkerKind.End);
  }

  private computeAndUpdateSatisfaction(kind: MarkerKind): number {
    this._lengthSatis = this.computeLengthSatisfaction();

    if (kind === MarkerKind.Start || kind === MarkerKind.Both) {
      this._startSatis = this.computeSatisfaction(this.startMarker, this._start);
    }
    if (kind === MarkerKind.End || kind === MarkerKind.Both) {
      this._endSatis = this.computeSatisfaction(this.endMarker, this._end);
    }

    return this.satisfaction;
  }

  private computeLengthSatisfaction(): number {
    const duration = this.query.atomic.duration;
    const length = this._end - this._start;
    if (!duration) { return this._start <= this._end ? 1 : 0; }
    if (duration.target === undefined) {
      return length >= duration.min && length <= duration.max ? 1 : 0;
    }
    return this.computeImageFromTimeBoundary(duration, length, 1);
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

  private initPlacement(): void {
    const sMarker = this.startMarker;
    const eMarker = this.endMarker;
    if (sMarker.time.target) {
      this._start = sMarker.time.target;
    }
    if (eMarker.time.target) {
      this._end = sMarker.time.target;
    }
    if (this._start === undefined) {
      this._start = this.query.atomic.duration && this._end ?
        this._end - this.getBestDuration(this.query.atomic.duration) : this.randomFromMarker(sMarker);
    }
    if (this._end === undefined) {
      this._end = this.query.atomic.duration ?
        this._start + this.getBestDuration(this.query.atomic.duration) : this.randomFromMarker(eMarker);
    }
    if (this._start > this._end) {
      const start = this._start;
      this._start = this._end;
      this._end = start;
    }
  }

  private getBestDuration(d: TimeBoundary): number {
    if (d.target) { return d.target; }
    if (d.min) { return d.min; }
    if (d.max) { return d.max; }
  }

  private randomFromMarker(m: Marker): number {
    const r = Math.random();
    return Math.floor(r * (m.time.max - m.time.min) + m.time.min);
  }
};
