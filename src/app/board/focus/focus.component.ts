import { Component, OnInit } from '@angular/core';

import { RootService } from '../shared/root.service';

@Component({
  moduleId: module.id,
  selector: 'app-focus',
  templateUrl: 'focus.component.html',
  styleUrls: ['focus.component.css'],
  providers: [RootService]
})
export class FocusComponent implements OnInit {
  currentActivity: string;

  constructor(root: RootService) {
    this.currentActivity = root.currentActivity;
  }

  ngOnInit() {
  }

}
