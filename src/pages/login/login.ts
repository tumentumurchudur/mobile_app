import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { IUser } from '../../interfaces';
import { AuthProvider } from '../../providers'
import { Store } from '@ngrx/store';
import { AppState } from '../../store/reducers';
import { UserLoggedIn } from '../../store/actions';

@IonicPage({
  name: 'LoginPage'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  private _user: IUser = {
    email: null,
    password: null,
    uid: null
  };

  constructor(
    private _store: Store<AppState>,
    private _auth: AuthProvider,
    public navCtrl: NavController
  ) { }

  private onLoginClick(user: IUser) {
    this._auth.loginWithEmail(user).subscribe(userInfo => {
      this._store.dispatch(new UserLoggedIn(userInfo));

      this.navCtrl.push('HomePage', { user: userInfo });
    }, error => {
      console.log('Login failed');
    });
  }

  private onSignUpClick(): void {
    this.navCtrl.push('SignUpPage');
  }

  private onResetPasswordClick(): void {
    this.navCtrl.push('ResetPasswordPage');
  }
}
