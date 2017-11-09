import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth'; //Add FirebaseApp
import { IUser } from '../interfaces';
import { Observable } from "rxjs/Observable";
import firebase from 'firebase';
import { Facebook } from '@ionic-native/facebook';


@Injectable()
export class AuthProvider {
  constructor(
      private _af: AngularFireAuth,
      private facebook: Facebook
  ) { }

  public loginWithEmail(user: IUser): Observable<IUser> {
    return Observable.create(observer => {
        this._af.auth.signInWithEmailAndPassword(user.email, user.password).then((authData) => {
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

  public loginWithFacebook(): Observable<IUser> {
    return Observable.create(observer => {
      this.facebook.login(['email']).then( (response) => {
        const facebookCredntial = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken)
        this._af.auth.signInWithCredential(facebookCredntial);
      }).catch((error) => {
        observer.error(error);
      });
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
}
