import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";

import { AuthProvider } from "../../providers/auth";
import { TRIGGER_PREP_FOR_LOGOUT, LogoutUser, TRIGGER_USER_CHECK } from "../actions";


@Injectable()
export class ProviderEffects {

  @Effect()
  public loadUserFromStorage$ = this._actions$
    .ofType(TRIGGER_USER_CHECK)


  @Effect()
  public logoutUser$ = this._actions$
    .ofType(TRIGGER_PREP_FOR_LOGOUT)
    .switchMap(() => {
      return this._auth.logoutUser();
    })
    .map(() => {
      return new LogoutUser();
    });

  constructor(
    private readonly _actions$: Actions,
    private readonly _auth: AuthProvider
  ) { }
}
