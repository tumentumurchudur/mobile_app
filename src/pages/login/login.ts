import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { IUser } from '../../interfaces';
import { AuthProvider } from '../../providers'
import { Store } from '@ngrx/store';
import { AppState } from '../../store/reducers';

@IonicPage({
  name: 'LoginPage'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  private _user: IUser = {
    email: "james@james.com", // "spark@vutiliti.com",
    password: "james123", //"spark123",
    uid: null
  };

  constructor(
    private _store: Store<AppState>,
    private _auth: AuthProvider,
    public navCtrl: NavController
  ) { }

  private onLoginClick(user: IUser) {
    this._auth.loginWithEmail(user).subscribe(userData => {
      this.navCtrl.push('HomePage', { user: userData });
    }, error => {
      console.log('Login failed');
    });
  }

  private onFacebookCLick() {
    this._auth.loginWithFacebook().subscribe()
  }

  private onSignUpClick(): void {
    this.navCtrl.push('SignUpPage');
  }

  private onResetPasswordClick(): void {
    this.navCtrl.push('ResetPasswordPage');
  }
}
