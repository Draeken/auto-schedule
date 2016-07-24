import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { RootService } from './shared/root.service'

@Component({
  moduleId: module.id,
  templateUrl: 'board.component.html',
  styleUrls: ['board.component.css'],
  directives: [ROUTER_DIRECTIVES],
  providers: [RootService]
})
export class BoardComponent implements OnInit {

  constructor() {}

  ngOnInit() {
  }

}
