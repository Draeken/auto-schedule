import { OpaqueToken } from '@angular/core';

import { AppConfig } from './';

const CONFIG: AppConfig = {
  scheduleDuration: 2 * 7 * 24 * 3600
};

export const APP_CONFIG = new OpaqueToken('app.config');

export const APP_CONFIG_PROVIDER = {
  provide: APP_CONFIG, useValue: CONFIG
};
