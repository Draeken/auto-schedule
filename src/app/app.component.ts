import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { APP_SHELL_DIRECTIVES } from '@angular/app-shell';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styles: [],
  directives: [
    ROUTER_DIRECTIVES,
    APP_SHELL_DIRECTIVES
  ]
})
export class AppComponent {
  title = 'app works!';
}
