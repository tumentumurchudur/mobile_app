import { Component } from "@angular/core";
import {NavController, AlertController, IonicPage} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { EmailValidator } from "../../validators/email-validator";
import { StoreServices } from "../../store/services/store-services";

@IonicPage({
  name: "ResetPasswordPage"
})
@Component({
  selector: "page-reset-password",
  templateUrl: "reset-password.html",
})
export class ResetPasswordPage {
  private _resetPasswordForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _storeServices: StoreServices,
    private _navCtrl: NavController,
    private _alertCtrl: AlertController
    ) {
    this._resetPasswordForm = _formBuilder.group({
      email: ["", Validators.compose([Validators.required, EmailValidator.isValid])],
    });
  }

  private _resetPassword() {
    if (this._resetPasswordForm.invalid) {
      const alert = this._alertCtrl.create({
        message: "Please enter a valid email address.",
        buttons: ["Ok"]
      });
      alert.present();
      return;
    }
    this._storeServices.resetPassword(this._resetPasswordForm.value.email);
    this._navCtrl.pop();
  }
}
