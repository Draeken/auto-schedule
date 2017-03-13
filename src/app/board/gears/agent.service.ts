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

@Injectable()
export class AgentService {

  private services: Observable<AgentInfo[]>;

  constructor(@Inject(appState) private appState: Observable<AppState>,
              @Inject(timelineState) private tlState: Observable<TimelineState>) {
    this.services = this.appState.pluck('agents').distinctUntilChanged();
  }

  get agents(): Observable<Agent[]> {
    return this.services.map((services: AgentInfo[]) => services.map(s => new AgentOnline(s)));
  }
}
