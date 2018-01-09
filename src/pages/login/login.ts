import { Component, OnInit } from "@angular/core";
import { IonicPage, NavController } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Keyboard } from '@ionic-native/keyboard';
import { IUser, IFbToken } from "../../interfaces";
import { AuthProvider } from "../../providers"
import { StoreServices } from "../../store/services";

@IonicPage({
  name: "LoginPage"
})
@Component({
  selector: "page-login",
  templateUrl: "login.html",
})
export class LoginPage {
  private _user: IUser = {
    email: null,
    password: null,
    uid: null
  };
  private _isNewUser: boolean = false;

  constructor(
    private _storeServices: StoreServices,
    private _auth: AuthProvider,
    public navCtrl: NavController,
    private _storage: Storage,
    private _splashScreen: SplashScreen,
    private _keyboard: Keyboard
  ) { }

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
    if (!this._validateUserInput(user)) {
      return;
    }

    if (this._isNewUser) {
      this.navCtrl.push("SignUpPage");
      return;
    }

    this._auth.loginWithEmail(user)
      .then(userData => {
        const user: IUser = this._createUser(userData);

        this._storeServices.addUser(user);

        this.navCtrl.push("HomePage");
      })
      .catch(error => {
        console.log("Password login failed: ", error);
      });
  }

  private _onFacebookClick(): void {
    this._auth.loginWithFacebook()
      .then(userData => {
        const user: IUser = this._createUser(userData);

        this._storeServices.addUser(user);

        this.navCtrl.push("HomePage");
      })
      .catch(error => {
        console.log("Facebook login failed: ", error)
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

  private _validateUserInput(user: IUser) {
    return user && user.email && user.password;
  }

  private _createUser(user: IUser): IUser {
    return {
      email: user.email,
      uid: user.uid,
      password: null,
      orgPath: null
    };
  }

  protected _keyboardSubmit() {
    this._keyboard.close();
    this._onLoginClick(this._user);
  }

}
