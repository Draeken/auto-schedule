import { provideRouter, RouterConfig } from '@angular/router';

import { BOARD_ROUTES } from './board/board.routes';

const routes: RouterConfig = [
  ...BOARD_ROUTES,
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
