import { Injectable } from "@angular/core";
import { AngularFireAuth } from "angularfire2/auth"; //Add FirebaseApp
import { IUser, IFbToken } from "../interfaces";
import { googleConfig } from "../configs";
import { Observable } from "rxjs/Observable";
import firebase from "firebase";
import { Facebook } from "@ionic-native/facebook";
import { GooglePlus } from "@ionic-native/google-plus";
import { Storage } from "@ionic/storage";

@Injectable()
export class AuthProvider {

  constructor(
      private _af: AngularFireAuth,
      private _facebook: Facebook,
      private _googleplus: GooglePlus,
      private _storage: Storage,

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
    })
    .catch(error => {
      throw new Error(error);
    });
  }

  private _googleSilentLogin(): Promise<IFbToken> {
     return this._googleplus.trySilentLogin({
      "webClientId": googleConfig.webClientId,
      "offline": true
    }).then((response) => {
        return firebase.auth.GoogleAuthProvider.credential(response.idToken);
     })
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
     })
  }

  private _signInWithCredential(credential: IFbToken): Promise<any> {
   this._storage.set("userInfo", credential);

   return this._af.auth.signInWithCredential(credential);
  }

  public resetPassword(emailAddr: string): Observable<IUser> {
    return Observable.create(observer => {
      this._af.auth.sendPasswordResetEmail(emailAddr).then(success => {
          observer.next(success);
        }).catch(error => {
          observer.error(error);
        });
    });
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
        this._storage.set("userInfo", credential);

        return this._af.auth.signInWithCredential(credential)
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

  public logoutUser(): void {
    this._af.auth.signOut().then(() => {
      this._storage.remove("userInfo");
    });
  }

}
