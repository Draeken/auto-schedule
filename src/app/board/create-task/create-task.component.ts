import { Component, OnInit } from '@angular/core';

import { TaskCreation } from './task-creation.model';

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss']
})
export class CreateTaskComponent implements OnInit {

  // Name - Time hours/week-day/day number/weekday in month/month restriction - reccurence - due date - duration - pause - simult - relative repulsion/attraction
  model = new TaskCreation("", "", "", "", "", "", 0, true, 0, "", null, 10000, 0, 0, 0, 0, false, "");

  constructor() { }

  ngOnInit() {
  }

  onSubmit() {
    console.log("submit");
  }

}
