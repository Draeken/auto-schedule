import { Injectable } from '@angular/core';

import { AgentService }  from './agent.service';
import { Activities }       from './activities.class';
import { AgentQuery }     from './agent-query.interface';
@Injectable()
export class ConflictHandlerService {

  constructor(private delivery: AgentService) {}

  tryToResolveConflicts(timeline: Activities): Activities {
    return timeline//this.handleFuzzy(timeline);
  }

  /**
   * Call this.putFuzzy on all timeline.fuzzyEntries
   */
  // private handleFuzzy(timeline: Activities): Activities {
  //   let queryIter = timeline.fuzzyEntries;
  //   let queryIterRes = queryIter.next();
  //   while (!queryIterRes.done) {
  //     let queriesWrapper = queryIterRes.value;
  //     let queries = queriesWrapper[1];
  //     queries.forEach(q => {
  //       this.putFuzzy(q, timeline);
  //     });
  //     queryIterRes = queryIter.next();
  //   }
  //   return timeline;
  // }

  /**
   * Find schedule hole with query.minimalDuration
   */
  // private putFuzzy(query: AgentQuery, timeline: Activities): void {
  //   let holes = timeline.getHoles(query.minimalDuration);
  //   holes.some(markers => {
  //     if (!markers[0] && markers[1].time - Date.now() < query.minimalDuration) {
  //       return false;
  //     }
  //     query.start = markers[0] ? markers[0].time : Date.now();
  //     query.end = markers[1] ? markers[1].time : Infinity;
  //     timeline.putMarkers(query);
  //     return true;
  //   });
  // }

}
