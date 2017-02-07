import { Injectable, Inject }                       from '@angular/core';
import { Http, Headers, RequestOptions, Response }  from '@angular/http';
import { Observable, Observer }                     from 'rxjs';

import { AppState }           from '../shared/app-state.interface';
import { action }             from '../shared/actions';
import { dispatcher, state }  from '../core/state-dispatcher.provider';
import { DataIOService }  from '../core/data-io.service';
import { UserStates, LoginStatus } from '../shared/user-states.interface';


@Injectable()
export class LoginService {

  private readonly clientTokenName = "client";
  private clientToken: string;
  private readonly serverUrl = 'http://localhost:3000/';

  constructor(private http: Http,
              @Inject(dispatcher) private dispatcher: Observer<action>,
              @Inject(state) private state: Observable<AppState>,
              private dataIo: DataIOService) {
    this.state
      .pluck('UserStates')
      .filter((us: UserStates) => us.loggedStatus == LoginStatus.notLogged)
      .subscribe(this.partialLogin);
  }

  partialLogin(): void {
    this.http.get(this.serverUrl + 'user/partial-login')
             .map(this.extractToken)
             .subscribe(this.handlePartialLogin);
  }

  tryToLogin(email: string, password: string): void {
    const dataLogin = {
      email: email,
      password: password
    };
    let headers = new Headers({ 'content-type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    this.http.post(this.serverUrl + 'user/login', dataLogin, options)
             .map(this.extractToken)
             .subscribe(this.handleFullLogin.bind(this, email));
  }

  private extractToken(res: Response): string {
    let body = res.json();
    return body ? body.token : undefined;
  }

  private handlePartialLogin(token: string): void {
    console.log(token)
  }

  private handleFullLogin(email: string, token: string): void {
    console.log(token);
  }

  private loginFail(): void {}

}
