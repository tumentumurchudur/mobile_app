import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { IUser } from '../../interfaces';
import { AuthProvider, DatabaseProvider } from '../../providers'

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
    password: null
  };

  constructor(
    private _auth: AuthProvider,
    private _db: DatabaseProvider,
    public navCtrl: NavController
  ) { }

  private onLoginClick(user: IUser) {
    this._auth.loginWithEmail(user).subscribe(data => {
      // this.navCtrl.push('HomePage');
      this._db.getOrg();
    }, error => {
      alert('Login failed');
    });
  }

  private onSignUpClick(): void {
    this.navCtrl.push('SignUpPage');
  }

  private onResetPasswordClick(): void {
    this.navCtrl.push('ResetPasswordPage');
  }
}
