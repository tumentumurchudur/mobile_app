import { Injectable } from "@angular/core";
import { AngularFireAuth } from "angularfire2/auth";
import {  AlertController } from "ionic-angular";
import { IUser, IFbToken } from "../interfaces";
import { googleConfig } from "../configs";
import { Observable } from "rxjs/Observable";
import firebase from "firebase";
import { Facebook } from "@ionic-native/facebook";
import { GooglePlus } from "@ionic-native/google-plus";
import { Storage } from "@ionic/storage";

@Injectable()
export class AuthProvider {
  private _user: IUser;

  constructor(
      private _af: AngularFireAuth,
      private _facebook: Facebook,
      private _googleplus: GooglePlus,
      private _alertCtrl: AlertController,
      private _storage: Storage
) { }

  public loginWithEmail(user: IUser): Promise<IUser> {
    const credential: IFbToken = firebase.auth.EmailAuthProvider.credential(user.email, user.password);

    return this._signInWithCredential(credential);
  }

  public registerUser(user: IUser): Observable<IUser> {
    return Observable.create(observer => {
      this._af.auth.createUserWithEmailAndPassword(user.email, user.password).then(authData => {
        observer.next(authData);
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  public loginWithGoogle(): Promise<IUser> {
    return this._googleplus.login({
      "webClientId": googleConfig.webClientId,
      "offline": true
    })
    .then(response => {
      const googleCredential: IFbToken = firebase.auth.GoogleAuthProvider.credential(response.idToken);

      return this._signInWithCredential(googleCredential);
    });
  }

  private _googleSilentLogin(): Promise<IFbToken> {
     return this._googleplus.trySilentLogin({
      "webClientId": googleConfig.webClientId,
      "offline": true
    }).then((response) => {
        return firebase.auth.GoogleAuthProvider.credential(response.idToken);
     });
  }

  public loginWithFacebook(): Promise<IUser> {
    return this._facebook.login(["email"])
      .then(response => {
        const facebookCredential: IFbToken = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);

        return this._signInWithCredential(facebookCredential);
      })
      .catch(error => {
        throw new Error(error);
      });
  }

  private _getFacebookToken(credential): Promise<IFbToken> {
     return this._facebook.login(["email"]).then((response) => {
        return firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
     });
  }

  private _signInWithCredential(credential: IFbToken): Promise<any> {
   return this._af.auth.signInWithCredential(credential).then(userData => {
     const user: IUser = {
       email: userData.email,
       uid: userData.uid,
       password: null,
       orgPath: null,
       providerData: credential,
       authenticated: true
     };
     return user;
   })
     .catch( error => {
       this._displayAndHandleErrors(error);
       return new Error(error);
     });
  }

  public resetPassword(emailAddr: string): Promise<any> {
    return this._af.auth.sendPasswordResetEmail(emailAddr).then(() => {
      const alert = this._alertCtrl.create({
        message: "Please check your email for a password reset link.",
        buttons: [
          {
            text: "Ok",
            role: "cancel",
            handler: () => {
            }
          }
        ]
      });
      alert.present();
    })
      .catch(error => {
        this._displayAndHandleErrors(error);
        return new Error(error);
      })
  }

  public getTokenId(): Observable<any> {
    return Observable.create(observer => {
      return firebase.auth().currentUser.getIdToken().then(token => {
        observer.next(token);
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  public loginUserFromStorage(userInfo: IFbToken): Promise<any> {
    return this._getUserCredentials(userInfo)
      .then((credential: IFbToken) => {
        return this._signInWithCredential(credential);
      })
      .catch(error => {
        // bubble up this error, so we can catch in the consumer.
        throw new Error(error);
      });
  }

  private _getUserCredentials(userInfo: IFbToken): Promise<IFbToken> {
    return new Promise((resolve, reject) => {
      if (!userInfo || !userInfo.providerId) {
        reject("userInfo is not available.");
      }

      switch (userInfo.providerId) {
        case "google.com":
          this._googleSilentLogin().then((credential: IFbToken) => {
            resolve(credential);
          });
          break;
        case "facebook.com":
          this._getFacebookToken(userInfo).then((credential: IFbToken) => {
            resolve(credential);
          });
          break;
        case "password":
          const credential: IFbToken = firebase.auth.EmailAuthProvider.credential(userInfo.a, userInfo.f);

          resolve(credential);
          break;
        default:
          reject("login type mismatch!");
      }
    });
  }

  private _displayAndHandleErrors(error: any) {
      let title;
      let message;
      let buttons;
      switch (error.code) {
        case "auth/user-not-found":
          title = "Could Not Complete Login";
          message = "Unfortunately, we could not find your account. Please double check your password or create an account.";
          buttons = [
            {text: "Try Again", role: "cancel"},
            {text: "Sign Up", handler: () => {
              // TODO: _UserSignUp() user goes here
            }}
          ];
          break;
        case "social-login-not-found":
          title = "Could Not Complete Login";
          message = "Unfortunately, we could not find your account. If you feel this is an error, try using a different social provider. Otherwise, create an account.";
          buttons = [
            {
              text: "Cancel", role: "cancel", handler: () => {
              this.logOutUser();
            }},
            {
              text: "Sign Up", role: "cancel", handler: () => { return null; }
            }
          ];
          break;
        case "auth/wrong-password":
          title = "The password is invalid. Please try again";
          message = error.message;
          buttons = ["Ok"];
          break;
        case "auth/email-already-in-use":
          title = "Could Not Complete Sign Up";
          message = error.message;
          buttons = ["Ok"];
          break;
        case "auth/account-exists-with-different-credential":
          title = "Try a Different Social Provider";
          message = error.message;
          buttons = ["Ok"];
          break;
        case "auth/internal-error" || "auth/invalid-credential":
          title = "Your login session has expired. Please login again.";
          message = error.message;
          buttons = ["Ok"];
          break;
        default:
          title = "Something Went Wrong";
          message = "Could not complete login at this time. Please try again";
          buttons =  ["Ok"];
      }

      this._alertCtrl.create({
        title: title,
        message,
        buttons
      })
        .present();
  }

  public logOutUser(): void {
    this._storage.remove("userInfo");
    this._af.auth.signOut().then(() => {
      // clears ALL storage. WARNING: HOT!
      this._storage.clear();
    });
  }

}
