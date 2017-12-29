import { Component, OnInit, OnDestroy, } from "@angular/core";
import { Subscription } from "rxjs/Subscription";

import { IonicPage, NavController } from "ionic-angular";
import { IUser } from "../../interfaces";
import { Store } from "@ngrx/store";
import { AppState } from "../../store/reducers";

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

  ngOnInit() {
    const subscription = this._store.select(state => state.user)
      .subscribe((user: IUser) => {
        this._user = user;
      });

    this._subscriptions.push(subscription);
  }

  ngOnDestroy() {
    for (const subscription of this._subscriptions) {
      subscription.unsubscribe();
    }
  }

  constructor(
    private _store: Store<AppState>,
    public nav: NavController
  ) { }

  protected changeMainView(newView: string): void {
    this.nav.push(newView);
  }

}
