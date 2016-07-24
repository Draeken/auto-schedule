import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { APP_SHELL_DIRECTIVES } from '@angular/app-shell';
import { MdSpinner } from '@angular2-material/progress-circle';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  template: `
  <!--<md-spinner *shellRender></md-spinner>-->
  <router-outlet *shellNoRender></router-outlet>
  `,
  styles: [],
  directives: [
    ROUTER_DIRECTIVES,
    APP_SHELL_DIRECTIVES,
    MdSpinner
  ]
})
export class AppComponent {
}
