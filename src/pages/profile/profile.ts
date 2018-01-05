import { Component, OnDestroy } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AuthProvider } from "../../providers";
import { StoreServices } from "../../store/services";
import { Subscription } from "rxjs/Subscription";

@IonicPage()
@Component({
  selector: "page-profile",
  templateUrl: "profile.html",
})
export class ProfilePage {
  private _subscriptions: Subscription[] = [];

  constructor(
    private _storeServices: StoreServices,
    public navCtrl: NavController,
    public navParams: NavParams,
    private _auth: AuthProvider
  ) {
  }

  private _onLogoutClick(): void {
   const logout = this._auth.logoutUser().subscribe(() => {
      this.navCtrl.pop();
    })

    this._subscriptions.push(logout);
  }

  ngOnDestroy() {
    for (const subscription of this._subscriptions) {
      subscription.unsubscribe();
    }
  }

}
