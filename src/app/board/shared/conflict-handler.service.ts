import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DeliveryService, Activities, ServiceQuery } from './';
import {  } from '../../shared';

@Injectable()
export class ConflictHandlerService {

  constructor(private delivery: DeliveryService) {}

  tryToResolveConflicts(timeline: Activities): Activities {
    return this.handleFuzzy(timeline);
  }

  private handleFuzzy(timeline: Activities): Activities {
    let queryIter = timeline.fuzzyEntries;
    let queryIterRes = queryIter.next();
    while (!queryIterRes.done) {
      let queriesWrapper = queryIterRes.value;
      const serviceName = queriesWrapper[0];
      let queries = queriesWrapper[1];
      queries.forEach(q => {
        this.putFuzzy(serviceName, q, timeline);
      });
      queryIterRes = queryIter.next();
    }
    return timeline;
  }

  private putFuzzy(sn: string, query: ServiceQuery, timeline: Activities): void {
    let holes = timeline.getHoles(query.minimalDuration);
    holes.some(markers => {
      if (!markers[0] && markers[1].time - Date.now() < query.minimalDuration) {
        return false;
      }
      query.start = markers[0] ? markers[0].time : Date.now();
      query.end = markers[1] ? markers[1].time : Infinity;
      timeline.putMarkers(sn, query);
      return true;
    });
  }

}
