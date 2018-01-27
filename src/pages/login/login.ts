import { Component, OnInit } from "@angular/core";
import { IonicPage, NavController, AlertController, MenuController } from "ionic-angular";
import { FormBuilder, FormGroup, Validators} from "@angular/forms";
import { Storage } from "@ionic/storage";
import { EmailValidator } from "../../validators/email-validator";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Keyboard } from "@ionic-native/keyboard";
import { IUser } from "../../interfaces";
import { AuthProvider } from "../../providers";
import { StoreServices } from "../../store/services";
import {Observable} from "rxjs/Observable";
import { ISubscription } from "rxjs/Subscription";

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
    uid: null,
    providerData: null,
    authenticated: false
  };
  private _isNewUser = false;
  private _subscription: ISubscription;
  private _userAuthenticated$: Observable<boolean>;

  constructor(
    private _storeServices: StoreServices,
    private _auth: AuthProvider,
    public navCtrl: NavController,
    private _alertCtrl: AlertController,
    private _formBuilder: FormBuilder,
    private _storage: Storage,
    private _splashScreen: SplashScreen,
    private _keyboard: Keyboard,
    private _menuCtrl: MenuController
  ) {
    this._loginForm = _formBuilder.group({
      email: ["", Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ["", Validators.compose([Validators.required, Validators.minLength(6)])]
    });
    this._userAuthenticated$ = this._storeServices.selectAuthenticated();

  }

  ngOnInit() {
    this._loginReturningUser();
  }

  ionViewWillEnter() {
    this._menuCtrl.swipeEnable(false);
  }

  ionViewWillLeave() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  private _loginReturningUser(): void {
    this._storage.get("userData")
      .then((userData: IUser) => {
        // Update the store with current user.
        if (!userData || !userData.email || !userData.uid) {
          throw new Error("userData is not valid.");
        }
        this._storeServices.addUser(userData);

        this.navCtrl.push("HomePage").then(() => {
          this._splashScreen.hide();
        });
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

    if (this._loginForm.dirty) {
      this._loginForm.controls["email"].markAsTouched();
      this._loginForm.controls["password"].markAsTouched();
      if (!this._loginForm.valid) {
        this._showError();
        return;
      }
      if (this._isNewUser) {
          this.navCtrl.push("SignUpPage");
          return;
      }

      this._storeServices.emailLogin(user);
      this._subscription = this._userAuthenticated$.subscribe((val) => {
        if (val) {
          this._loginForm.reset();
          this._loginForm.controls["email"].clearValidators();
          this._loginForm.controls["password"].clearValidators();

          this.navCtrl.push("HomePage");
        }
      });
    }
  }

  private _onFacebookClick(): void {
    this._storeServices.socialLogin("facebook");
    this._subscription = this._userAuthenticated$.subscribe((val) => {
      if (val) {
        this.navCtrl.push("HomePage");
      }
    });
  }

  private _onGoogleClick(): void {
    this._storeServices.socialLogin("google");
    this._subscription = this._userAuthenticated$.subscribe((val) => {
      if (val) {
        this.navCtrl.push("HomePage");
      }
    });
  }

  private _onResetPasswordClick(): void {
    this.navCtrl.push("ResetPasswordPage");
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

}
