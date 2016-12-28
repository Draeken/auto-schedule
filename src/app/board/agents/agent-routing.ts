import { SleepConfigComponent } from './sleep/sleep-config/sleep-config.component';

export const agentRouting = [
  { path: 'agents/sleepconfig', component: SleepConfigComponent, outlet: 'parameter'},
];
