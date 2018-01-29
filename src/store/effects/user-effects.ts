import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";
import { AuthProvider } from "../../providers/auth";
import {
  AddUser,
  TRIGGER_SOCIAL_LOGIN,
  TRIGGER_EMAIL_LOGIN,
  LOGIN_SUCCESS,
  TRIGGER_PREP_FOR_LOGOUT,
  LoginSuccess,
  RESET_PASSWORD,
} from "../actions";
import { IUser } from "../../interfaces/index";
import {Observable} from "rxjs/Observable";

@Injectable()
export class UserEffects {

  /**
   * Handles TRIGGER_EMAIL_LOGIN action and
   * logs in a user with their email and password.
   */
  @Effect()
  public emailLogin$ = this._actions$
    .ofType(TRIGGER_EMAIL_LOGIN)
    .map((action: any) => action.payload)
    .switchMap((user: IUser) => {
      return Observable.fromPromise(
      this._auth.loginWithEmail(user)
      )
    })
    .map((user: any) => {
      if(!user.email || !user.uid) {
        return;
      }
      return new LoginSuccess(user);
    });

  /**
   * Handles TRIGGER_SOCIAL_LOGIN action and
   * logs in a user with their email and password.
   */
  @Effect()
  public socailLogin$ = this._actions$
    .ofType(TRIGGER_SOCIAL_LOGIN)
    .map((action: any) => action.payload)
    .switchMap((socialType: string) => {
      if (socialType === "google") {
        return this._auth.loginWithGoogle();
      }
        return this._auth.loginWithFacebook();
    })
    .map((user: IUser) => {
      if(!user.email || !user.uid) {
        return;
      }
      return new LoginSuccess(user);
    });

  /**
   * Handles LOGIN_SUCCESS action and
   * confirms Login and updates Store with authenticated: true.
   */
  @Effect()
  public loginSuccess$ = this._actions$
    .ofType(LOGIN_SUCCESS)
    .map((action: any) => action.payload)
    .map((user: any) => {
      return new AddUser(user);
    });


  /**
   * Handles TRIGGER_PREP_FOR_LOGOUT action and
   * logs out user and removes local Storage.
   */
  @Effect({ dispatch: false })
  public logOutUser$ = this._actions$
    .ofType(TRIGGER_PREP_FOR_LOGOUT)
    .map(() => {
      return this._auth.logOutUser();
    });

  /**
   * Handles RESET_PASSWORD action and
   * sends password reset command.
   */
  @Effect({ dispatch: false })
  public resetPassword$ = this._actions$
    .ofType(RESET_PASSWORD)
    .map((action: any) => action.payload)
    .switchMap((emailAdd: string) => {
      return this._auth.resetPassword(emailAdd);
    });

  constructor(
    private readonly _actions$: Actions,
    private readonly _auth: AuthProvider

  ) { }
}
