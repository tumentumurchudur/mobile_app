import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";

import { IonicPage, NavController, MenuController } from "ionic-angular";
import { IUser } from "../../interfaces";
import { Store } from "@ngrx/store";
import { AppState } from "../../store/reducers";
import { StoreServices } from "../../store/services/store-services";

@IonicPage({
  name: "HomePage"
})
@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage implements OnInit, OnDestroy {
  private _user: IUser;
  private _subscriptions: Subscription[] = [];
  private _sideMenuStatus$: Observable<any>;

  ngOnInit() {
    const subscription: Subscription = this._store.select(state => state.user)
      .subscribe((user: IUser) => {
        this._user = user;
      });

    this._subscriptions.push(subscription);
  }

  ionViewWillEnter(){
    this._menuCtrl.swipeEnable(true);
  }

  ionViewWillLeave() {
    this._menuCtrl.swipeEnable(false);
  }

  ngOnDestroy() {
    console.log("destroyed");
    for (const subscription of this._subscriptions) {
      subscription.unsubscribe();
    }

    // this._storeServices.log
  }

  constructor(
    private _store: Store<AppState>,
    public nav: NavController,
    private _menuCtrl: MenuController,
    private _storeServices: StoreServices
  ) {
    this._sideMenuStatus$ = this._storeServices.sideMenuStatus();

  }

  private _openSiseMenu(): void {
    this._storeServices.sideMenuOpen(true);
    this._menuCtrl.open();
  }

}
