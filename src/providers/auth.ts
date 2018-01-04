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

  public loginWithEmail(user: IUser): Observable<IUser> {
    return Observable.create(observer => {
      const credential: IFbToken = firebase.auth.EmailAuthProvider.credential(user.email, user.password);
      this._signInWithCredential(credential).then((authData) => {
          observer.next(authData);
        }).catch((error) => {
          observer.error(error);
        });
    });
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

  public loginWithGoogle(): Observable<IUser> {
    return Observable.create(observer => {
      this._googleplus.login({
        "webClientId": googleConfig.webClientId,
        "offline": true
      }).then((response) => {
        const googleCredential: IFbToken = firebase.auth.GoogleAuthProvider.credential(response.idToken);

        this._signInWithCredential(googleCredential).then((authData) => {
          observer.next(authData);
        });
      }).catch((error) => {
        observer.error(error);
      });
    });
  }

  private _googleSilentLogin(): Promise<any> {
     return this._googleplus.trySilentLogin({
      "webClientId": googleConfig.webClientId,
      "offline": true
    }).then((response) => {
        const googleCredential: IFbToken = firebase.auth.GoogleAuthProvider.credential(response.idToken);
        return Promise.resolve(googleCredential);
      })
  }

  public loginWithFacebook(): Observable<IUser> {
    return Observable.create(observer => {
      this._facebook.login(["email"]).then((response) => {
        const facebookCredential: IFbToken = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);

        this._signInWithCredential(facebookCredential).then((authData) => {
          observer.next(authData);
        });
      }).catch((error) => {
        observer.error(error);
      });
    });
  }

  private _getFacebookToken(credential): Promise<any> {
     return this._facebook.login(["email"]).then((response) => {
        const facebookCredential: IFbToken = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
       return Promise.resolve(facebookCredential);

     })
  }

  private _signInWithCredential(credential: IFbToken): Promise<any> {
   return this._storage.set("userInfo", credential).then(() => {
      return this._af.auth.signInWithCredential(credential);
    });
  }

  public resetPassword(emailAddr: string): Observable<IUser> {
    return Observable.create(observer => {
      this._af.auth.sendPasswordResetEmail(emailAddr).then(success => {
          observer.next(success);
        }, error => {
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

  // TODO: Add interface for authProvider info
  public loginUserFromStorage(userInfo: any): Observable<any> {
    return this._getUserCredentials(userInfo)
      .switchMap((credential: IFbToken) => {
      this._storage.set("userInfo", credential);

      return this._af.auth.signInWithCredential(credential).then((authData) => {
          return authData;
        });

      })
  }

  private _getUserCredentials(userInfo: IFbToken): Observable<any>{
    return Observable.create(observer => {
      switch (userInfo.providerId) {
        case "google.com":
          this._googleSilentLogin().then((val) => {
            observer.next(val);
          });
          break;
        case "facebook.com":
          this._getFacebookToken(userInfo).then((val) => {
            observer.next(val);
          });
          break;
        case "password":
          const credential = firebase.auth.EmailAuthProvider.credential(userInfo.a, userInfo.f);

          observer.next(credential);
          break;
      }
    })
  }

  public logoutUser(): Observable<IUser> {
    return Observable.create(observer => {
      return this._af.auth.signOut().then(() => {
        this._storage.remove("userInfo");
        observer.next();
     }).catch((error) => {
      observer.error(error);
     });
    });
  }

}
