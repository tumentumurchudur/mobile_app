import { Component, OnInit, OnDestroy } from "@angular/core";
import { IonicPage, NavController } from "ionic-angular";

import { Storage } from "@ionic/storage";
import { SplashScreen } from "@ionic-native/splash-screen";
import { IUser, IFbToken } from "../../interfaces";
import { AuthProvider } from "../../providers"
import { StoreServices } from "../../store/services";
import { Subscription } from "rxjs/Subscription";



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
  private _subscriptions: Subscription[] = [];

  constructor(
    private _storeServices: StoreServices,
    private _auth: AuthProvider,
    public navCtrl: NavController,
    private _storage: Storage,
    private _splashScreen: SplashScreen
  ) {
  }

  ngOnInit() {
    this._storage.get("userInfo").then((val: IFbToken) => {
      if (val.providerId) {
       const subscription = this._auth.loginUserFromStorage(val).subscribe(userData => {
          if (userData) {
            const user: IUser = {
              email: userData.email,
              uid: userData.uid,
              password: null,
              orgPath: null
            };

            // Update the store with current user.
            this._storeServices.addUser(user);

            this.navCtrl.push("HomePage").then(() => {
              this._splashScreen.hide();
            });
          } else return;

        }, (error) => {
          console.log("Login failed:", error);
        });
        this._subscriptions.push(subscription);

      } else this._splashScreen.hide();
    });
  }

  ngOnDestroy() {
    for (const subscription of this._subscriptions) {
      subscription.unsubscribe();
    }
  }

  private _onLoginOptionClick() {
    this._isNewUser = false;
  }

  private _onSignUpOptionClick() {
    this._isNewUser = true;
  }

  private _onLoginClick(user: IUser): void {
    if (!this._isNewUser) {
      this._auth.loginWithEmail(user).subscribe(userData => {
        const user: IUser = {
          email: userData.email,
          uid: userData.uid,
          password: null,
          orgPath: null
        };

        // Update the store with current user.
        this._storeServices.addUser(user);

        this.navCtrl.push("HomePage");
      }, (error) => {
        console.log("Login failed:", error);
      });
    } else {
      this.navCtrl.push("SignUpPage");
    }
  }

  private _onFacebookClick(): void {
    this._auth.loginWithFacebook().subscribe(userData => {
      const user: IUser = {
        email: userData.email,
        uid: userData.uid,
        password: null,
        orgPath: null
      };

      this._storeServices.addUser(user);

      this.navCtrl.push("HomePage");
    }, (error) => {
      console.log("Login failed:", error);
    })
  }

  private _onGoogleClick(): void {
    this._auth.loginWithGoogle().subscribe(userData => {
      const user: IUser = {
        email: userData.email,
        uid: userData.uid,
        password: null,
        orgPath: null
      };

      this._storeServices.addUser(user);

      this.navCtrl.push("HomePage");
    }, (error) => {
      console.log("Login failed:", error);
    })
  }

  private _onResetPasswordClick(): void {
    this.navCtrl.push("ResetPasswordPage");
  }
}
