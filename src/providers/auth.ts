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

  private _signInWithCredential(credential) {
    this._storage.set("userInfo", credential);
    return this._af.auth.signInWithCredential(credential);
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

  public getUserFromStorage() : Observable<any> {
    return Observable.create(observer => {
      return firebase.auth().currentUser.getIdToken().then(token => {
        observer.next(token);
      }).catch(error => {
        observer.error(error);
      });
    });
  }

}
