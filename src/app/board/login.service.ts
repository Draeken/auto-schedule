import { Injectable, Inject }                       from '@angular/core';
import { Http, Headers, RequestOptions, Response }  from '@angular/http';
import { Observable, Observer }                     from 'rxjs';

import { AppState }                 from '../shared/app-state.interface';
import { action,
         ChangeLoginStatusAction }  from '../shared/actions';
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
      .pluck('UserStates')
      .filter((us: UserStates) => us.loggedStatus == LoginStatus.notLogged)
      .subscribe(this.partialLogin);
  }

  private partialLogin(): void {
    this.http.get(this.serverUrl + 'user/partial-login')
             .map(this.extractToken)
             .subscribe(this.handlePartialLogin);
  }

  attemptLogin(email: string, password: string): void {
    const userLocalInfo = JSON.parse(localStorage.getItem(this.userLocalKey));
    const anoToken = userLocalInfo ? userLocalInfo.token : undefined;
    const dataLogin = {
      email: email,
      password: password,
      anoToken: anoToken
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
    if (!token) {
      console.error('No token');
    }
    const userInfo: LocalUserInfo = {
      token: token
    };
    localStorage.setItem(this.userLocalKey, JSON.stringify(userInfo));
    this.dispatcher.next(new ChangeLoginStatusAction(LoginStatus.partialLogged));
  }

  private handleFullLogin(email: string, token: string): void {
    if (!token) {
      console.error('No token');
    }
    const userInfo: LocalUserInfo = {
      token: token,
      email: email
    };
    localStorage.setItem(this.userLocalKey, JSON.stringify(userInfo));
    this.dispatcher.next(new ChangeLoginStatusAction(LoginStatus.fullyLogged));
  }

}
