import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { PossiblePos, Marker } from './timeline.class';
import { AgentQuery, TimeBoundary } from '../agent-query.interface';
import { Placement, MoveKind } from './placement.class';

interface Conflict {
  startBoundary: number;
  placementOne: Placement;
  placementTwo: Placement;
  endBoundary: number;
}
interface Period {
  next: Placement;
  start: number;
  end: number;
  prev: Placement;
}

interface ConflictNeighbor {
  prev: Placement;
  limit: number;
  next: Placement;
  avgSatis: number;
}

export class OptimalPlacement {
  constructor(private minTime: number, private maxTime: number) {}

  arrangePlacement(placements: Placement[]): void {
    let conflict = this.findConflict(placements);
    while (conflict) {
      this.resolveConflict(conflict);
      conflict = this.findConflict(placements);
    }
    this.equalizeSatis(placements);
  }

  private equalizeSatis(placements: Placement[]): void {
    const maxLoop = 30;
    const maxGap = 0.15;
    const neighborhood = new Neighborhood(placements);
    let toBoost = this.findPlacementsToBoost(placements, maxGap);
    let i = 0;
    while (i++ < maxLoop && toBoost.length) {
      neighborhood.applyBestNeighbor(toBoost);
      toBoost = this.findPlacementsToBoost(placements, maxGap);
    }
  }

  private findPlacementsToBoost(placements: Placement[], maxGap: number): Placement[] {
    return [];
  }

  private resolveConflict(conflict: Conflict): void {
    const p1 = conflict.placementOne;
    const p2 = conflict.placementTwo;
    let periods: Period[] = [];
    periods.push(this.intersection(conflict.startBoundary, p1, p2, conflict.endBoundary));
    periods.push(this.intersection(conflict.startBoundary, p2, p1, conflict.endBoundary));
    periods = periods.filter(p => p !== undefined);

    if (!periods.length) {
      // ask user
      console.warn(`Conflict can't be automatically resolved: ${p1}, ${p2}.`);
    }
    const bestLimit = periods
      .map(this.getBestNeighbor)
      .reduce((cn1, cn2) => cn1.avgSatis > cn2.avgSatis ? cn1 : cn2);
    bestLimit.prev.setEnd(bestLimit.limit);
    bestLimit.next.setStart(bestLimit.limit);
  }

  private getBestNeighbor(limits: Period): ConflictNeighbor {
    const allPeriods: number[] = [];
    const division = 5;
    const periodPart = (limits.end - limits.start) / division;
    for (let i = 0; i < division; ++i) {
      allPeriods.push(limits.start + i * periodPart);
    }
    const testPrev = limits.prev.clone();
    const testNext = limits.next.clone();
    let bestAvgSatis = 0;
    let bestLimit: number;
    allPeriods.map(limit => {
      testPrev.setEnd(limit);
      testNext.setStart(limit);
      const currentAvgSatis = testPrev.additiveSat + testNext.additiveSat;
      if (currentAvgSatis > bestAvgSatis) {
        bestAvgSatis = currentAvgSatis;
        bestLimit = limit;
      }
    });
    return {
      prev: limits.prev,
      limit: bestLimit,
      next: limits.next,
      avgSatis: bestAvgSatis
    };
  }

  private intersection(startBoundary: number, next: Placement, prev: Placement, endBoundary: number): Period {
    const marker1 = next.startMarker;
    const marker2 = prev.endMarker;
    const start = Math.max(marker1.time.min > marker2.time.min ? marker1.time.min : marker2.time.min, startBoundary);
    const end = Math.min(marker1.time.max < marker2.time.max ? marker1.time.max : marker2.time.max, endBoundary);
    if (start > end) { return undefined; }
    return {
      prev: prev,
      start: start,
      end: end,
      next: next
    };
  }

  private findConflict(placements: Placement[]): Conflict {
    let past = placements[0];

    for (let i = 1; i < placements.length; ++i) {
      const current = placements[i];
      if (past.end > current.start && !past.query.dontColide && !current.query.dontColide) {
        const startBoundary = i === 1 ? this.minTime : placements[i - 2].end;
        const endBoundary = i === placements.length - 1 ? this.maxTime : placements[i + 1].start;
        return {
          startBoundary: startBoundary,
          placementOne: past,
          placementTwo: current,
          endBoundary: endBoundary
        };
      }
      past = current;
    }
  }
}

// function computeBestPlacement(start: Marker, end: Marker, query: AgentQuery): Placement {
//   let loopCount = 0;
//   const bestPos = new Placement(start, end, query);
//   const currentPos = new Placement(start, end, query);
//   const maxLoop = 20;
//   const neighborhood = new Neighborhood(currentPos);
//
//   currentPos.setStartEnd(start.time.target || start.time.max, end.time.target || end.time.min);
//
//   while (loopCount++ < maxLoop) {
//     const satis = neighborhood.selectBestNeighbor();
//     if (satis > bestPos.satisfaction) {
//       bestPos.setStartEnd(currentPos.start, currentPos.end);
//       loopCount = 0;
//     }
//   }
//   return bestPos;
// }

interface MoveInfo {
  kind: MoveKind;
  value: number;
  satisfaction: number;
  additionalMove: MoveInfo[];
}

interface Bound {
  start: number;
  end: number;
}

class Neighborhood {
  private moveMap = new Map<Placement, MoveInfo[]>();

  constructor(private allPlacements: Placement[]) {}

  applyBestNeighbor(placements: Placement[]): void {
    placements.forEach(p => {
      if (this.moveMap.has(p)) {
        this.checkMoves(p);
      } else {
        this.createEntry(p);
      }
    });
  }

  private createEntry(placement: Placement): void {
    const moves: MoveInfo[] = [];
    moves.push(...this.buildMove(MoveKind.Start, placement, [-1, 1]));
    moves.push(...this.buildMove(MoveKind.End, placement, [-1, 1]));
    this.moveMap.set(placement, moves);
  }

  private buildMove(kind: MoveKind, placement: Placement, direction: number[]): MoveInfo[] {
    const division = 5;
    const bounds: Bound[] = (m =>
      m.time.target ? [{ start: m.time.min, end: m.time.target }, { start: m.time.target, end: m.time.max }]
        : [{ start: m.time.min, end: m.time.max }]).call(this, placement.getMarkers(kind));
    const position = placement.getPosition(kind);

    return direction.map(d => {
      const bound = bounds.reduce((b1, b2) => b1.start <= position + d &&  d + position <= b1.end ? b1 : b2);
      const newPos = position + ((bound.end - bound.start) / division) * d;
      const value = this.clampTarget(newPos, bound.start, bound.end);

      return this.simulateMove(placement, kind, value);
    });
  }

  private simulateMove(placement: Placement, kind: MoveKind, moveValue: number): MoveInfo {
    const pClone = placement.clone();
    const pSatis = pClone.updatePos(kind, moveValue);
    const moveInfo = {
      kind: kind,
      value: moveValue,
      satisfaction: pSatis,
      additionalMove: []
    };
    this.allPlacements.forEach(p => {
      const args = this.checkColision(p, pClone, placement);
      if (args) { moveInfo.additionalMove.push(this.simulateMove.apply(this, args)); }
    });
    return moveInfo;
  }

  private checkColision(pTest: Placement, pCloned: Placement, pOri: Placement): [Placement, MoveKind, number] {
    if (pTest === pCloned || pTest.query.dontColide) { return; }
    const isInside = pTest.start >= pCloned.start && pTest.end <= pCloned.end;
    if ((pTest.start <= pCloned.start && pTest.end > pCloned.start) || (isInside && pTest.end <= pOri.start)) {
      const value = -1 * (pTest.end - pCloned.start);
      return [pTest, MoveKind.End, value];
    } else if ((pTest.start < pCloned.end && pTest.end >= pCloned.end) || (isInside && pTest.start >= pOri.end)) {
      const value = pCloned.end - pTest.start;
      return [pTest, MoveKind.Start, value];
    }
  }

  private clampTarget(target: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, target));
  }

  private checkMoves(placement: Placement): void {
    const movesToAdd = new Map<MoveKind, number[]>();
    movesToAdd.set(MoveKind.Start, [-1, 1]);
    movesToAdd.set(MoveKind.End, [-1, 1]);
    const existingMoves = this.moveMap.get(placement);

    existingMoves.forEach(em => {
      const directions = movesToAdd.get(em.kind);
      const i = directions.findIndex(v => (em.value > 0) === (v > 0));
      directions.splice(i, 1);
    });

    movesToAdd.forEach((dirs, kind) => {
      if (!dirs.length) { return; }
      existingMoves.push(...this.buildMove(kind, placement, dirs));
    });
  }
}

// class Neighborhood {
//   private readonly taboo: Map<MoveKind, number[]> = new Map();
//   private readonly steps: Map<MoveKind, number[]> = new Map();
//
//   constructor(private placement: Placement) {
//     this.initSetAndSteps(placement.startMarker.time, MoveKind.Start);
//     this.initSetAndSteps(placement.endMarker.time, MoveKind.End);
//   }
//
//   private initSetAndSteps(t: TimeBoundary, m: MoveKind) {
//     if (!t.target) {
//       this.taboo.set(m, []);
//       this.steps.set(m, [Math.floor((t.max - t.min) / 20)]);
//     } else {
//       this.taboo.set(m, []);
//       this.steps.set(m, [Math.floor((t.target - t.min) / 10), Math.floor((t.max - t.target) / 10)]);
//     }
//   }
//
//   selectBestNeighbor(): number {
//     const neighbor: Move[] = this.selectNeighbor(this.placement.startMarker, MoveKind.Start, this.placement.start)
//       .concat(this.selectNeighbor(this.placement.endMarker, MoveKind.End, this.placement.end));
//     let bestSatis = 0;
//     let bestMove: Move;
//     neighbor.forEach(move => {
//       const satis = this.placement.updatePos(move.kind, move.value);
//       if (satis > bestSatis) {
//         bestMove = move;
//         bestSatis = satis;
//       }
//     });
//     this.placement.updatePos(bestMove.kind, bestMove.value);
//     return bestSatis;
//   }
//
//   private selectNeighbor(t: TimeBoundary, m: MoveKind, curPos: number): Move[] {
//     const forward: Move = { kind: m, value: this.nextNotInTaboo(t, curPos, m, true) };
//     const backward: Move = { kind: m, value: this.nextNotInTaboo(t, curPos, m, true) };
//
//     return [forward, backward].filter(v => v !== undefined);
//   }
//
//   private nextNotInTaboo(t: TimeBoundary, curPos: number, m: MoveKind, forward: boolean): number {
//     const taboo = this.taboo.get(m);
//     const steps = this.steps.get(m);
//
//     let nextPos = curPos;
//     while (taboo.find(n => n === nextPos)) {
//       let step: number;
//       if (forward) { step = !t.target ? steps[0] : nextPos + steps[0] > t.target ? steps[0] : steps[1];
//       } else { step = -1 * (!t.target ? steps[0] : nextPos - steps[1] > t.target ? steps[1] : steps[0]); }
//
//       nextPos += step;
//       if (forward && nextPos > t.max || !forward && nextPos < t.min) {
//         nextPos = undefined;
//         break;
//       }
//     }
//     return nextPos;
//   }
// }

interface Move {
  kind: MoveKind;
  value: number;
}
