import { Injectable, Inject }                       from '@angular/core';
import { Http, Headers, RequestOptions, Response }  from '@angular/http';
import { Observable, Observer }                     from 'rxjs';

import { AppState }                 from '../shared/app-state.interface';
import { action,
         UpdateLoginStatusAction }  from '../shared/actions';
import { UserStates, LoginStatus }  from '../shared/user-states.interface';
import { LocalUserInfo }            from '../shared/local-user-info.interface';
import { dispatcher, state }        from '../core/state-dispatcher.provider';
import { DataIOService }            from '../core/data-io.service';


@Injectable()
export class LoginService {

  private readonly userLocalKey = 'user';
  private clientToken: string;
  private readonly serverUrl = 'http://localhost:3000/';

  constructor(private http: Http,
              @Inject(dispatcher) private dispatcher: Observer<action>,
              @Inject(state) private state: Observable<AppState>,
              private dataIo: DataIOService) {
    this.state
      .pluck('userStates')
      .filter((us: UserStates) => us.loggedStatus == LoginStatus.notLogged)
      .distinctUntilChanged()
      .subscribe(this.partialLogin.bind(this));
  }

  private partialLogin(): void {
    this.http.post(this.serverUrl + 'user/partial-login', '')
             .map(this.extractToken)
             .subscribe(this.handlePartialLogin.bind(this));
  }

  attemptLogin(email: string, password: string): void {
    const userLocalInfo = JSON.parse(localStorage.getItem(this.userLocalKey));
    const anoToken = userLocalInfo ? userLocalInfo.token : undefined;
    const dataLogin = {
      token: anoToken,
      userInfo: {
        email: email,
        password: password,
      }
    };
    let headers = new Headers({ 'content-type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    this.http.post(this.serverUrl + 'user/login', dataLogin, options)
             .map(this.extractToken)
             .subscribe(this.handleFullLogin.bind(this, email));
  }

  private extractToken(res: Response): string {
    let body;
    try {
      body = res.json();
    } catch(e) {
      body = undefined;
    }
    return body ? body.token : undefined;
  }

  private handlePartialLogin(token: string): void {
    if (!token) {
      console.error('No token');
      return;
    }
    const userInfo: LocalUserInfo = {
      token: token
    };
    localStorage.setItem(this.userLocalKey, JSON.stringify(userInfo));
    this.dispatcher.next(new UpdateLoginStatusAction(LoginStatus.partialLogged));
  }

  private handleFullLogin(email: string, token: string): void {
    let userInfo;
    if (!token) {
      console.error('No new token');
      userInfo = JSON.parse(localStorage.getItem(this.userLocalKey));
      userInfo.email = email;
    } else {
      userInfo = {
        token: token,
        email: email
      };
    }
    localStorage.setItem(this.userLocalKey, JSON.stringify(userInfo));
    this.dispatcher.next(new UpdateLoginStatusAction(LoginStatus.fullyLogged));
  }

}
