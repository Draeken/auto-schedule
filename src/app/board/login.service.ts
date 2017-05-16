import { Injectable, Inject } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { AppState } from '../core/app-state/app-state.interface';
import { AppAction,
         UpdateLoginStatusAction } from '../core/app-state/actions';
import { UserStates, LoginStatus } from '../core/app-state/user-states.interface';
import { LocalUserInfo } from '../shared/local-user-info.interface';
import { appDispatcher, appState } from '../core/app-state/state-dispatcher.provider';
import { DataIOService } from '../core/data-io.service';

interface LoginPayload {
  token: string;
  userInfo: {
    email: string;
    password: string;
  };
}

@Injectable()
export class LoginService {
  private clientToken: string;
  private readonly serverUrl;

  constructor(private http: Http,
              @Inject(appDispatcher) private dispatcher: Observer<AppAction>,
              @Inject(appState) private state: Observable<AppState>,
              private dataIo: DataIOService) {
    this.serverUrl = this.dataIo.getServerAPIAddress();
    this.state
      .pluck('userStates')
      .filter((us: UserStates) => us.loggedStatus === LoginStatus.notLogged)
      .distinctUntilChanged()
      .subscribe(this.partialLogin.bind(this));
  }

  private partialLogin(): void {
    this.http.post(this.serverUrl + 'user/partial-login', '')
             .map(res => this.dataIo.extractBody.call(this.dataIo, res))
             .subscribe(this.handlePartialLogin.bind(this));
  }

  attemptLogin(email: string, password: string): void {
    const anoToken = this.dataIo.getUserInfo().token;
    const dataLogin: LoginPayload = {
      token: anoToken,
      userInfo: {
        email: email,
        password: password,
      }
    };

    this.http.post(this.serverUrl + 'user/login', dataLogin, this.dataIo.getJsonHeader())
             .map(res => this.dataIo.extractBody.call(this.dataIo, res))
             .subscribe(this.handleFullLogin.bind(this, email));
  }



  private handlePartialLogin(body: any): void {
    if (!body) { console.error(`No server response.`); return; }
    const token = body.token;
    if (!token) {
      console.error('No token');
      return;
    }
    const userInfo: LocalUserInfo = {
      token: token
    };
    this.dataIo.setUserInfo(userInfo);
    this.dispatcher.next(new UpdateLoginStatusAction(LoginStatus.partialLogged));
  }

  private handleFullLogin(email: string, body: any): void {
    let userInfo: LocalUserInfo;
    if (!body) { console.error(`No server response.`); return; }
    const token = body.token;
    if (!token) {
      console.error('No new token');
      userInfo = this.dataIo.getUserInfo();
      userInfo.email = email;
    } else {
      userInfo = {
        token: token,
        email: email
      };
    }
    this.dataIo.setUserInfo(userInfo);
    this.dispatcher.next(new UpdateLoginStatusAction(LoginStatus.fullyLogged));
  }

}
