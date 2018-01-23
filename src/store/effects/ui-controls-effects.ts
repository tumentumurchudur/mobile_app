import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";

@Injectable()
export class ProviderEffects {

  constructor(
    private readonly _actions$: Actions
  ) { }
}
