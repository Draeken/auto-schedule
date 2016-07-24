import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-focus',
  templateUrl: 'focus.component.html',
  styleUrls: ['focus.component.css'],
  providers: []
})
export class FocusComponent implements OnInit {
  currentActivity: string;

  constructor() {
    this.currentActivity = 'test';
  }

  ngOnInit() {
  }

}
