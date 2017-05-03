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
    let avgSatis = 1;
    if (placements.length > 1) {
        avgSatis = placements.map(p => p.satisfaction).reduce((s1, s2) => s1 + s2) / placements.length;
    }
    return placements.filter(p => p.satisfaction < avgSatis * (1 - maxGap));
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

interface MoveInfo {
  placement: Placement;
  kind: MoveKind;
  value: number;
  satisfaction: number;
  additionalMove: MoveInfo[];
}

interface Bound {
  start: number;
  end: number;
}

interface MoveCheck {
  kinds?: MoveKind[];
  directions: number[];
}

class Neighborhood {
  private moveMap = new Map<Placement, MoveInfo[][]>();

  constructor(private allPlacements: Placement[]) {}

  applyBestNeighbor(placements: Placement[]): void {
    placements.forEach(p => {
      if (this.moveMap.has(p)) {
        this.checkMoves(p);
      } else {
        this.createEntry(p);
      }
    });
    this.findBestAndApply();
  }

  private findBestAndApply(): void {
    let bestAvgSatis = 0;
    let bestMove: MoveInfo[];
    for (const [_, movesInfos] of this.moveMap) {
      const localBestMove = <[MoveInfo[], number]>movesInfos
        .map((m1) => {
          const avgSatis = m1.map(m => this.computeAvgSatis(m)).reduce((a1, a2) => a1 + a2) / m1.length;
          return [m1, avgSatis];
        })
        .reduce((m1, m2) => m1[1] > m2[1] ? m1 : m2);
      if (localBestMove[1] > bestAvgSatis) {
        bestAvgSatis = localBestMove[1];
        bestMove = localBestMove[0];
      }
    }
    this.applyMove(bestMove);
  }

  private applyMove(moveInfos: MoveInfo[]): void {
    if (!moveInfos.length) { return; }
    const placements: Placement[] = [];
    moveInfos.forEach(moveInfo => {
      moveInfo.placement.updatePos(moveInfo.kind, moveInfo.value);
      this.moveMap.delete(moveInfo.placement);
      placements.push(moveInfo.placement);
      this.applyMove(moveInfo.additionalMove);
    });
    this.moveMap.forEach((moves, key, map) => {
      map.set(key, moves.filter(m => !this.findPlacement(placements, m)));
    });
  }

  private findPlacement(placements: Placement[], moveInfos: MoveInfo[]): boolean {
    if (!moveInfos.length) { return false; }
    return moveInfos.some(moveInfo => {
      return placements.some(p => p === moveInfo.placement) || this.findPlacement(placements, moveInfo.additionalMove);
    });
  }

  private computeAvgSatis(moveInfo: MoveInfo): number {
    const addiSatis = moveInfo.additionalMove.length ? moveInfo.additionalMove
      .map(m => this.computeAvgSatis(m))
      .reduce((m1, m2) => m1 + m2) : 1;
    return (moveInfo.satisfaction * addiSatis) / (moveInfo.additionalMove.length + 1);
  }

  private createEntry(placement: Placement): void {
    const moves: MoveInfo[][] = [];
    moves.push(...this.buildOneKindMove(MoveKind.Start, placement, [-1, 1]));
    moves.push(...this.buildOneKindMove(MoveKind.End, placement, [-1, 1]));
    moves.push(...this.buildTwoKindMove(placement, [-1, 1]));
    this.moveMap.set(placement, moves);
  }

  private buildTwoKindMove(placement: Placement, direction: number[]): MoveInfo[][] {
    const timelineHoles = this.getTimelineHolesFromPlacement(placement);
    const currentHoleI = timelineHoles.findIndex(hole => placement.start >= hole.start && placement.end <= hole.end);
    const currentHole = timelineHoles[currentHoleI];
    const timeShift = (currentHole.end - currentHole.start) / 10;
    return direction.map(d => {
      let sVal = placement.start + timeShift * d;
      let eVal = placement.end + timeShift * d;
      if ((sVal < currentHole.start && currentHoleI > 0) || (eVal > currentHole.end && currentHoleI < timelineHoles.length)) {
        const newDestBound = d < 0 ? timelineHoles[currentHoleI - 1].end : timelineHoles[currentHoleI + 1].start;
        const placementLength = placement.end - placement.start;
        sVal = d < 0 ? newDestBound - placementLength : newDestBound;
        eVal = d < 0 ? newDestBound : newDestBound + placementLength;
      }
      return this.simulateMove(placement, [MoveKind.Start, MoveKind.End], [sVal, eVal]);
    });
  }

  private getTimelineHolesFromPlacement(placement: Placement): Bound[] {
    const range = this.computeMoveBound(placement);
    const minimalTime = placement.end - placement.start;
    const allPlacements = this.allPlacements.filter(p => p !== placement);
    const bounds: Bound[] = [];
    let i = 0;
    for (; i < allPlacements.length; ++i) {
      if (allPlacements[i].end > range.start) { break; }
    }
    let startBound = range.start;
    if (allPlacements[i].end >= range.end) {
      return [];
    }
    startBound = allPlacements[i].end;
    for (; i < allPlacements.length; ++i) {
      if (allPlacements[i].start >= range.end) { break; }
      const currentP = allPlacements[i];
      const cStart = currentP.start;
      const cEnd = currentP.end;
      if (cStart - startBound >= minimalTime) {
        bounds.push({
          start: startBound,
          end: cStart
        });
      }
      startBound = cEnd;
    }
    if (startBound < range.end) {
      bounds.push({
        start: startBound,
        end: range.end
      });
    }

    return bounds;
  }

  private computeMoveBound(placement: Placement): Bound {
    const startM = placement.startMarker;
    const endM = placement.endMarker;
    const length = placement.end - placement.start;
    const startB = Math.max(startM.time.min, endM.time.min - length);
    const endB = Math.min(endM.time.max, startM.time.max + length);
    return {
      start: startB,
      end: endB
    };
  }

  private buildOneKindMove(kind: MoveKind, placement: Placement, direction: number[]): MoveInfo[][] {
    const division = 5;
    const m = placement.getMarker(kind);
    const bounds: Bound[] =  m.time.target ? [{ start: m.time.min, end: m.time.target }, { start: m.time.target, end: m.time.max }]
        : [{ start: m.time.min, end: m.time.max }];
    const position = placement.getPosition(kind);

    return direction.map(d => {
      const bound = bounds.reduce((b1, b2) => b1.start <= position + d &&  d + position <= b1.end ? b1 : b2);
      const newPos = position + ((bound.end - bound.start) / division) * d;
      const value = this.clampTarget(newPos, bound.start, bound.end);
      return this.simulateMove(placement, [kind], [value]);
    });
  }

  private simulateMove(placement: Placement, kinds: MoveKind[], moveValues: number[]): MoveInfo[] {
    const pClone = placement.clone();
    kinds.forEach((kind, i) => {
      pClone.updatePos(kind, moveValues[i]);
    });
    const pSatis = pClone.satisfaction - placement.satisfaction;

    const moveInfos = kinds.map((kind, i) => ({
      placement: placement,
      kind: kind,
      value: moveValues[i],
      satisfaction: pSatis,
      additionalMove: []
    }));
    this.allPlacements.forEach(p => {
      const args = this.checkColision(p, pClone, placement);
      if (args) { moveInfos[0].additionalMove.push(this.simulateMove.apply(this, args)); }
    });
    return moveInfos;
  }

  private checkColision(pTest: Placement, pCloned: Placement, pOri: Placement): [Placement, MoveKind, number] {
    if (pTest === pOri || pTest.query.dontColide) { return; }
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
    const movesToAdd: MoveCheck[] = [];
    movesToAdd.push({ kinds: [MoveKind.Start], directions: [-1, 1] });
    movesToAdd.push({ kinds: [MoveKind.End], directions: [-1, 1] });
    movesToAdd.push({ kinds: [MoveKind.Start, MoveKind.End], directions: [-1, 1] });
    const existingMoves = this.moveMap.get(placement);

    existingMoves.forEach(em => {
      const moveCheck = movesToAdd.find(mta => mta.kinds.every((mtaKind, i) => mtaKind === em[i].kind));
      const directions = moveCheck.directions;
      const i = directions.findIndex(v => (em[0].value > 0) === (v > 0));
      directions.splice(i, 1);
    });

    movesToAdd.forEach((moveCheck) => {
      const dirs = moveCheck.directions;
      const kinds = moveCheck.kinds;
      if (!dirs.length) { return; }
      const moves = kinds.length === 1 ? this.buildOneKindMove(kinds[0], placement, dirs) : this.buildTwoKindMove(placement, dirs);
      existingMoves.push(...moves);
    });
  }
}
