import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";

import { AuthProvider } from "../../providers/auth";
import { TRIGGER_PREP_FOR_LOGOUT, LogoutUser, TRIGGER_USER_CHECK } from "../actions";
import {RESET_PASSWORD} from "../actions/user-actions";

@Injectable()
export class UserEffects {

  @Effect({ dispatch: false })
  public logOutUser$ = this._actions$
    .ofType(TRIGGER_PREP_FOR_LOGOUT)
    .map(() => {
      return this._auth.logOutUser();
    });

  @Effect({ dispatch: false })
  public resetPassword$ = this._actions$
    .ofType(RESET_PASSWORD)
    .map((action: any) => action.payload)
    .switchMap((emailAdd) => {
      return this._auth.resetPassword(emailAdd);
    });

  constructor(
    private readonly _actions$: Actions,
    private readonly _auth: AuthProvider
  ) { }
}
