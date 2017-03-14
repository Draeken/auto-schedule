import { Injectable,
         Inject }           from '@angular/core';
import { Observable,
         BehaviorSubject }  from 'rxjs';

import { AppState}            from '../../core/app-state/app-state.interface';
import { appState }              from '../../core/app-state/state-dispatcher.provider';
import { timelineState }              from '../../core/timeline-state/state-dispatcher.provider';
import { TimelineState}            from '../../core/timeline-state/timeline-state.interface';
import { Agent }                          from '../agents/agent.abstract';
import { AgentOnline }                    from '../agents/agent-online.class';
import { AgentInfo }      from '../agents/agent-info.interface';
import { TransformResult } from './resource-mapper.service';
import { Task,
         TaskHelper } from './task.interface';
import { Permission }  from '../agents/permissions.class';

interface UpdateRequestAgent {
  ids: number[];
  update: Object;
}

interface TransformResultAgent {
  inserted: loki.Doc[];
  updateRequest: UpdateRequestAgent[];
  deleted: number[];
}

@Injectable()
export class AgentService {

  private services: Observable<AgentInfo[]>;

  constructor(@Inject(appState) private appState: Observable<AppState>,
              @Inject(timelineState) private tlState: Observable<TimelineState>) {
    this.services = this.appState.pluck('agents').distinctUntilChanged();

    //Watch timeline for doneTask and notify agent if flag is present.
  }

  get agents(): Observable<Agent[]> {
    return this.services.map((services: AgentInfo[]) => services.map(s => new AgentOnline(s)));
  }

  registerTransformColl(mapObs: Observable<Map<string, TransformResult>>): void {
    mapObs.withLatestFrom(this.agents).subscribe(this.notifyAgents);
  }

  private notifyAgents(context: [Map<string, TransformResult>, Agent[]]) {
    let map = context[0];
    let agents = context[1];

    agents.forEach(agent => {
      let notifyLoad: any = {};
      agent.service.userPermission.getCollectionsWith(Permission.Watch).forEach(c => {
        notifyLoad[c] = this.mapTransResultForAgent(map.get(c), [{}]);
      });
      agent.service.userPermission.getDocumentsWith(Permission.Watch).forEach((docs, collName) => {
        notifyLoad[collName] = this.mapTransResultForAgent(map.get(collName), docs);
      });
      agent.notifyStateChange(notifyLoad);
    })
  }

  private mapTransResultForAgent(tr: TransformResult, docDescs: Object[]): TransformResultAgent {
    let createSet = (collection: loki.Collection) => {
      let set = new Set<loki.Doc>();
      docDescs.forEach(docDesc => collection.find(docDesc).forEach(doc => set.add(doc)))
      return set;
    }
    let updates = createSet(tr.updated);
    let updateRequest: UpdateRequestAgent[];
    let inserted = createSet(tr.inserted);
    let deleted = createSet(tr.deleted);

    tr.updateRequest.forEach(ur => {
      let docsIds = ur.docs.filter(doc => {
        if (!updates.has(doc)) { return false; }
        updates.delete(doc);
        return true;
      }).map(d => d.$loki);

      if (docsIds.length === 0) { return; }
      updateRequest.push({ ids: docsIds, update: ur.update });
    });
    return {
      inserted: [...inserted.values()],
      updateRequest: updateRequest,
      deleted: [...deleted.values()].map((dt: loki.Doc) => dt.$loki)
    };
  }
}
