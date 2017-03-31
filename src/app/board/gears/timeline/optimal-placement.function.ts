import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { PossiblePos, Marker } from './timeline.class';
import { AgentQuery, TimeBoundary } from '../agent-query.interface';
import { Placement, MoveKind } from './placement.class';

export function optimalPlacement(query: AgentQuery, pos: PossiblePos, timeline: Placement[]): Placement[] {
  const placements: Placement[] = [];

  pos.start.forEach(start => {
    pos.end.forEach(end => {
      placements.push(computeBestPlacement(start, end, query));
    });
  });

  return placements;
}

function computeBestPlacement(start: Marker, end: Marker, query: AgentQuery): Placement {
  let loopCount = 0;
  const bestPos = new Placement(start, end, query);
  const currentPos = new Placement(start, end, query);
  const maxLoop = 20;
  const neighborhood = new Neighborhood(currentPos);

  currentPos.setStartEnd(start.time.target || start.time.max, end.time.target || end.time.min);

  while (loopCount++ < maxLoop) {
    const satis = neighborhood.selectBestNeighbor();
    if (satis > bestPos.satisfaction.value) {
      bestPos.setStartEnd(currentPos.start, currentPos.end);
      loopCount = 0;
    }
  }
  return bestPos;
}

class Neighborhood {
  private readonly taboo: Map<MoveKind, number[]> = new Map();
  private readonly steps: Map<MoveKind, number[]> = new Map();

  constructor(private placement: Placement) {
    this.initSetAndSteps(placement.startMarker.time, MoveKind.Start);
    this.initSetAndSteps(placement.endMarker.time, MoveKind.End);
  }

  private initSetAndSteps(t: TimeBoundary, m: MoveKind) {
    if (!t.target) {
      this.taboo.set(m, []);
      this.steps.set(m, [Math.floor((t.max - t.min) / 20)]);
    } else {
      this.taboo.set(m, []);
      this.steps.set(m, [Math.floor((t.target - t.min) / 10), Math.floor((t.max - t.target) / 10)]);
    }
  }

  selectBestNeighbor(): number {
    const neighbor: Move[] = this.selectNeighbor(this.placement.startMarker, MoveKind.Start, this.placement.start)
      .concat(this.selectNeighbor(this.placement.endMarker, MoveKind.End, this.placement.end));
    let bestSatis = 0;
    let bestMove: Move;
    neighbor.forEach(move => {
      const satis = this.placement.updatePos(move.kind, move.value);
      if (satis > bestSatis) {
        bestMove = move;
        bestSatis = satis;
      }
    });
    this.placement.updatePos(bestMove.kind, bestMove.value);
    return bestSatis;
  }

  private selectNeighbor(t: TimeBoundary, m: MoveKind, curPos: number): Move[] {
    const forward: Move = { kind: m, value: this.nextNotInTaboo(t, curPos, m, true) };
    const backward: Move = { kind: m, value: this.nextNotInTaboo(t, curPos, m, true) };

    return [forward, backward].filter(v => v !== undefined);
  }

  private nextNotInTaboo(t: TimeBoundary, curPos: number, m: MoveKind, forward: boolean): number {
    const taboo = this.taboo.get(m);
    const steps = this.steps.get(m);

    let nextPos = curPos;
    while (taboo.find(n => n === nextPos)) {
      let step: number;
      if (forward) { step = !t.target ? steps[0] : nextPos + steps[0] > t.target ? steps[0] : steps[1];
      } else { step = -1 * (!t.target ? steps[0] : nextPos - steps[1] > t.target ? steps[1] : steps[0]); }

      nextPos += step;
      if (forward && nextPos > t.max || !forward && nextPos < t.min) {
        nextPos = undefined;
        break;
      }
    }
    return nextPos;
  }
}

interface Move {
  kind: MoveKind;
  value: number;
}
