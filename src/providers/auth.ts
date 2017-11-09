import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth'; //Add FirebaseApp
import { IUser } from '../interfaces';
import { Observable } from "rxjs/Observable";
import firebase from 'firebase';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';


@Injectable()
export class AuthProvider {
  constructor(
      private _af: AngularFireAuth,
      private facebook: Facebook,
      private googleplus: GooglePlus
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

  public loginWithGoogle(): Observable<IUser> {
    return Observable.create(observer => {
      this.googleplus.login({
        'webClientId': '664713118536-hughg731mofacehql9kbqu09pjbeheui.apps.googleusercontent.com',
        'offline': true
      }).then( (response) => {
        const googleCredential = firebase.auth.GoogleAuthProvider.credential(response.idToken);
        firebase.auth().signInWithCredential(googleCredential).then((authData) => {
          observer.next(authData);
        });
      }).catch((error) => {
          console.log("error from google", error);
        observer.error(error);
      });
    });
  }

  public loginWithFacebook(): Observable<IUser> {
    return Observable.create(observer => {
      this.facebook.login(['email']).then( (response) => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
        this._af.auth.signInWithCredential(facebookCredential).then((authData) => {
          observer.next(authData);
        });
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
