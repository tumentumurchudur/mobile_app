import { Component, OnInit } from "@angular/core";
import { IonicPage, NavController, AlertController } from "ionic-angular";
import { FormBuilder, FormGroup, Validators} from "@angular/forms";
import { Storage } from "@ionic/storage";
import { EmailValidator } from "../../validators/email-validator";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Keyboard } from "@ionic-native/keyboard";
import { IUser, IFbToken } from "../../interfaces";
import { AuthProvider } from "../../providers";
import { StoreServices } from "../../store/services";

@IonicPage({
  name: "LoginPage"
})
@Component({
  selector: "page-login",
  templateUrl: "login.html",
})
export class LoginPage {
  public _loginForm: FormGroup;
  private _user: IUser = {
    email: null,
    password: null,
    uid: null
  };
  private _isNewUser = false;

  constructor(
    private _storeServices: StoreServices,
    private _auth: AuthProvider,
    public navCtrl: NavController,
    private _alertCtrl: AlertController,
    private _formBuilder: FormBuilder,
    private _storage: Storage,
    private _splashScreen: SplashScreen,
    private _keyboard: Keyboard
  ) {
    this._loginForm = _formBuilder.group({
      email: ["", Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ["", Validators.compose([Validators.required, Validators.minLength(6)])]
    });

  }

  ngOnInit() {
    this._loginReturningUser();
  }

  private _loginReturningUser(): void {
    this._storage.get("userInfo")
      .then((userInfo: IFbToken) => {
        if (!userInfo || !userInfo.providerId) {
          throw new Error("User is not available in local storage.");
        }

        return this._auth.loginUserFromStorage(userInfo);
      })
      .then(userData => {
        if (!userData || !userData.email || !userData.uid) {
          throw new Error("userData is not valid.");
        }

        const user: IUser = this._createUser(userData);
        this.navCtrl.push("HomePage");

        // Update the store with current user.
        this._storeServices.addUser(user);

        this._splashScreen.hide();
      })
      .catch(error => {
        console.log(error);

        this._splashScreen.hide();
      });
  }

  private _onLoginOptionClick() {
    this._isNewUser = false;
  }

  private _onSignUpOptionClick() {
    this._isNewUser = true;
  }

  private _onLoginClick(user: IUser): void {
    user.email = this._loginForm.value.email.toLowerCase().trim();
    user.password =  this._loginForm.value.password;

    if (this._isNewUser) {
      this.navCtrl.push("SignUpPage");
      return;
    }

    if (this._loginForm.dirty) {
      this._loginForm.controls["email"].markAsTouched();
      this._loginForm.controls["password"].markAsTouched();
      if (!this._loginForm.valid) {
        this._showError();
        return;
      } else {
        this._auth.loginWithEmail(user)
          .then(userData => {
            const user: IUser = this._createUser(userData);

            this._loginForm.reset();
            this._loginForm.controls["email"].clearValidators();
            this._loginForm.controls["password"].clearValidators();

            this._storeServices.addUser(user);

            this.navCtrl.push("HomePage");
          });
      }
    }
  }

  private _onFacebookClick(): void {
    this._auth.loginWithFacebook()
      .then(userData => {
        const user: IUser = this._createUser(userData);

        this._storeServices.addUser(user);

        this.navCtrl.push("HomePage");
      })
      .catch(error => {
        console.log("Facebook login failed: ", error);
      });
  }

  private _onGoogleClick(): void {
    this._auth.loginWithGoogle()
      .then(userData => {
        const user: IUser = this._createUser(userData);

        this._storeServices.addUser(user);

        this.navCtrl.push("HomePage");
      })
      .catch(error => {
        console.log("Google login failed:", error);
      });
  }

  private _onResetPasswordClick(): void {
    this.navCtrl.push("ResetPasswordPage");
  }

  private _createUser(user: IUser): IUser {
    return {
      email: user.email,
      uid: user.uid,
      password: null,
      orgPath: null
    };
  }

  private _showError() {
    let message: string;
    let buttons: any[];

    if (!this._loginForm.controls["email"].valid && !this._loginForm.controls["password"].valid) {
      message = `Please enter a valid email address.\n
        Password must be at least 6 characters.`;
      buttons = [{text: "Try again", role: "cancel"}];
    } else if (!this._loginForm.controls["email"].valid) {
      message = "Please enter a valid email address.";
      buttons = [{text: "Try again", role: "cancel"}];
    } else if (!this._loginForm.controls["password"].valid) {
      message = "Password must be at least 6 characters.";
      buttons = [{text: "Try again", role: "cancel"}];
    }

    this._alertCtrl.create({
      title: "Error",
      message,
      buttons
    })
    .present();
  }

  protected _keyboardSubmit() {
    this._keyboard.close();
    this._onLoginClick(this._user);
  }

}
