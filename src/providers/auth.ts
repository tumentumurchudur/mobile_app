import { Injectable } from "@angular/core";
import { AngularFireAuth } from "angularfire2/auth"; //Add FirebaseApp
import { IUser } from "../interfaces";
import { googleConfig } from "../configs";
import { Observable } from "rxjs/Observable";
import firebase from "firebase";
import { Facebook } from "@ionic-native/facebook";
import { GooglePlus } from "@ionic-native/google-plus";
import { Storage } from "@ionic/storage";


@Injectable()
export class AuthProvider {
  private _credential: any;

  constructor(
      private _af: AngularFireAuth,
      private _facebook: Facebook,
      private _googleplus: GooglePlus,
      private _storage: Storage

) { }

  public loginWithEmail(user: IUser): Observable<IUser> {
    return Observable.create(observer => {
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, user.password);
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
        const googleCredential = firebase.auth.GoogleAuthProvider.credential(response.idToken);

        this._signInWithCredential(googleCredential).then((authData) => {
          observer.next(authData);
        });
      }).catch((error) => {
        observer.error(error);
      });
    });
  }

  public googleSilentLogin() {
    return Observable.create(observer => {
      this._googleplus.trySilentLogin({
      "webClientId": googleConfig.webClientId,
      "offline": true
    }).then((response) => {
      const credential = firebase.auth.GoogleAuthProvider.credential(response.idToken);

        observer.next(credential);
    }).catch((error) => {
      observer.error(error);
      });
    })
  }

  public loginWithFacebook(): Observable<IUser> {
    return Observable.create(observer => {
      this._facebook.login(["email"]).then((response) => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);

        this._signInWithCredential(facebookCredential).then((authData) => {
          observer.next(authData);
        });
      }).catch((error) => {
        observer.error(error);
      });
    });
  }

  private _getFacebookToken(credential) {
    this._facebook.getAccessToken().then(token => {
      if (credential['accessToken'] != token) {
        return this._credential = token;
      }
      return token;
    });
  }

  private _signInWithCredential(credential) {
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

  public loginUserFromStorage(userInfo) : Observable<any> {
    return Observable.create(observer => {
      if (userInfo) {
        let credential;

        switch (userInfo["providerId"]) {
          case "google.com":
            this.googleSilentLogin().subscribe((val) => {
              credential = val;
            });
            break;
          case "facebook.com":
            this._getFacebookToken(userInfo);
            credential = firebase.auth.FacebookAuthProvider.credential(this._credential);
            break;
          case 'password':
            credential = firebase.auth.EmailAuthProvider.credential(userInfo['a'], userInfo['f']);
            break;
        }
        this._signInWithCredential(credential).then((authData) => {
          observer.next(authData);
        }).catch(error => {
          observer.error(error);
        });
      }
      else {
        observer.next();
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
