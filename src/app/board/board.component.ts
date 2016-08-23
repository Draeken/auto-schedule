import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { ConductorService, DeliveryService, ConflictHandlerService } from './shared';
import { DataIO } from '../shared';

@Component({
  moduleId: module.id,
  templateUrl: 'board.component.html',
  styleUrls: ['board.component.css'],
  directives: [ROUTER_DIRECTIVES],
  providers: [
    DataIO,
    DeliveryService,
    ConflictHandlerService,
    ConductorService,
  ]
})
export class BoardComponent implements OnInit {

  constructor(private conductor: ConductorService) {}

  ngOnInit() {
  }

}
