import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";

@IonicPage({
  name: "ResetPasswordPage"
})
@Component({
  selector: "page-reset-password",
  templateUrl: "reset-password.html",
})
export class ResetPasswordPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ResetPasswordPage");
  }

}
