import { Component } from '@angular/core';
import { NavParams, IonicPage } from 'ionic-angular';
import { IUser } from '../../interfaces';

@IonicPage({
  name: 'HomePage'
})
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private _user: IUser;

  constructor(private navParams: NavParams) {
    this._user = navParams.get('user');
  }

  get user(): IUser {
    return this._user;
  }

}
