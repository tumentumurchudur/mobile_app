import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { IUser } from '../../interfaces';
import { DatabaseProvider } from '../../providers';

@IonicPage({
  name: 'HomePage'
})
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  private _user: IUser;
  private _orgPath: string;

  constructor(
    private _db: DatabaseProvider,
    private navCtrl: NavController,
    private navParams: NavParams
  ) {
      this._user = navParams.get('user');
  }

  ngOnInit() {
    this._db.getOrgPath(this._user.uid).then(path => {
      this._orgPath = path;
    });
  }

  get user(): IUser {
    return this._user;
  }

}
