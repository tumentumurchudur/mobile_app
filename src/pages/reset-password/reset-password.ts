import { Component } from "@angular/core";
import {NavController, AlertController, IonicPage} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { EmailValidator } from "../../validators/email-validator";
import { AuthProvider } from "../../providers"

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
    private _auth: AuthProvider,
    private _navCtrl: NavController,
    private _alertCtrl: AlertController
    ) {
    this._resetPasswordForm = _formBuilder.group({
      email: ["", Validators.compose([Validators.required, EmailValidator.isValid])],
    });
  }

  private _resetPassword() {
    if (this._resetPasswordForm.invalid) {
      let alert = this._alertCtrl.create({
        message: "Please enter a valid email address.",
        buttons: ["Ok"]
      });
      alert.present();
    }
    else {
      this._auth.resetPassword(this._resetPasswordForm.value.email).then((user) => {
        let alert = this._alertCtrl.create({
          message: "Please check your email for a password reset link.",
          buttons: [
            {
              text: "Ok",
              role: "cancel",
              handler: () => {
                this._navCtrl.pop();
              }
            }
          ]
        });
        alert.present();
      }, (error) => {
        let errorMessage: string = error.message;
        let errorAlert = this._alertCtrl.create({
          message: errorMessage,
          buttons: ["Ok"]
        });
        errorAlert.present();
      });
    }
  }

}
