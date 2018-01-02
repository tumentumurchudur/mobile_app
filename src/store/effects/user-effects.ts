import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";

import { AuthProvider } from "../../providers/auth";


@Injectable()
export class ProviderEffects {

  @Effect()
  public loadUser$ = this._actions$
    .ofType()


  @Effect()
  public logoutUser$ = this._actions$
    .ofType()


  constructor(
    private readonly _actions$: Actions,
    private readonly _db: AuthProvider
  ) { }
}
