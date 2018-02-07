import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";
import { Storage } from "@ionic/storage";

import { IonicPage, MenuController } from "ionic-angular";
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
  private _selectSideMenuStatus$: Observable<any>;

  ngOnInit() {
    const subscription: Subscription = this._store.select(state => state.user)
      .subscribe((user: IUser) => {
        this._user = user;
      });

    this._subscriptions.push(subscription);

    // Checks for reads in local storage for the lineChart to consume
    this._checkForLineReads();
  }

  ionViewWillEnter() {
    this._menuCtrl.swipeEnable(true);
  }

  ionViewWillLeave() {
    this._menuCtrl.swipeEnable(false);
  }

  ngOnDestroy() {
    for (const subscription of this._subscriptions) {
      subscription.unsubscribe();
    }
  }

  private _checkForLineReads() {
    this._storage.get("readsData").then((lineReads) => {
      if (!lineReads) {
        return;
      }

      lineReads.forEach((read) => {
        read.startDate = new Date(read.startDate);
        read.endDate = new Date(read.endDate);

        read.deltas.forEach(delta => {
          delta.date = new Date(delta.date);
        });
      });

      this._storeServices.addReads(lineReads);
    });
  }

  constructor(
    private _store: Store<AppState>,
    private _menuCtrl: MenuController,
    private _storeServices: StoreServices,
    private _storage: Storage
  ) {
    this._selectSideMenuStatus$ = this._storeServices.selectSideMenuStatus();
  }

  private _openSideMenu(): void {
    this._storeServices.sideMenuOpen();
    this._menuCtrl.open();
  }

}
