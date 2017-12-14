import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";

import { Observable } from "rxjs/rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/observable/fromPromise";

import { DatabaseProvider } from "../../providers";

import { TRIGGER_NEIGHBORHOOD_READS } from "../actions";
import { IMeter } from "../../interfaces/meter";

@Injectable()
export class NeighborhoodEffects {
  @Effect({ dispatch: false })
  public reads$ = this._actions$
    .ofType(TRIGGER_NEIGHBORHOOD_READS)
    .map((action: any) => action.payload)
    .switchMap((meter: IMeter) => {
      return Observable.combineLatest(
        this._db.getNeighborhoodGroupIds(meter)
      )
    })
    .map((data: any) => {
      const [id] = data;

      console.log("data => ", data, id);
    });

  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider,
  ) { }
}
