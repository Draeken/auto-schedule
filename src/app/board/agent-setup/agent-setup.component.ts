import { Component, OnInit, Inject }  from '@angular/core';
import { Router }                     from '@angular/router';
import { Observable, Observer }       from 'rxjs';

import { action }             from '../../shared/actions';
import { AppState }           from '../../shared/app-state.interface';
import { dispatcher, state }  from '../../core/state-dispatcher.provider';
import { DeliveryService }    from '../gears/delivery.service';
import { Agent }              from '../agents/agent.abstract';

@Component({
  selector: 'app-agent-setup',
  templateUrl: './agent-setup.component.html',
  styleUrls: ['./agent-setup.component.scss']
})
export class AgentSetupComponent implements OnInit {

  private agents: Observable<Agent[]>;

  constructor(
    @Inject(dispatcher) private dispatcher: Observer<action>,
    @Inject(state) private state: Observable<AppState>,
    private delivery: DeliveryService,
    private router: Router,
  ) {
    this.agents = this.delivery.agents;
  }

  showAction(url) {
    this.router.navigate(['', { outlets: {'parameter': 'agents/' + url}}]);
  }

  ngOnInit() {
  }

}
