import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AuthProvider } from "../../providers";
import { StoreServices } from "../../store/services";

@IonicPage()
@Component({
  selector: "page-profile",
  templateUrl: "profile.html",
})
export class ProfilePage {

  constructor(
    private _storeServices: StoreServices,
    public navCtrl: NavController,
    public navParams: NavParams,
    private _auth: AuthProvider
  ) {
  }

  private _onLogoutClick(): void {
   this._auth.logOutUser();
   this.navCtrl.setRoot("LoginPage");
  }

}
