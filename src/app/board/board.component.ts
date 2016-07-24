import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { ConductorService } from './shared/conductor.service';
import { DeliveryService } from './shared/delivery.service';

@Component({
  moduleId: module.id,
  templateUrl: 'board.component.html',
  styleUrls: ['board.component.css'],
  directives: [ROUTER_DIRECTIVES],
  providers: [
    ConductorService,
    DeliveryService
  ]
})
export class BoardComponent implements OnInit {

  constructor() {}

  ngOnInit() {
  }

}
