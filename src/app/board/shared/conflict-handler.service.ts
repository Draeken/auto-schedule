import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DeliveryService } from './';
import {  } from '../../shared';

@Injectable()
export class ConflictHandlerService {

  constructor(private delivery: DeliveryService) {}

}
