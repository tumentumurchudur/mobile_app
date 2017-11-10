import { Injectable } from '@angular/core';
import { Effect, Actions } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import { Storage } from "@ionic/storage";

import { Observable } from "rxjs/rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/observable/fromPromise";

import { LOAD_METERS, LOAD_FROM_DB, AddMeters, LoadMeters, LoadFromDb } from "../actions";
import { DatabaseProvider } from "../../providers";
import { IMeter } from "../../interfaces";

import { CostHelper } from "../../helpers";

@Injectable()
export class MainEffects {
  @Effect() public checkCacheData = this._actions$
    .ofType(LOAD_METERS)
    .map((action: any) => action.payload)
    .switchMap((uid: any) => {
      if (!uid) {
        return Observable.of([]);
      }

      return Observable.combineLatest(
        Observable.fromPromise(
          this._storage.get("metersTest").then(meters => {
            if (meters && meters.length) {
              return meters;
            }
            return [];
          })
        ),
        Observable.of(uid)
      );
    })
    .map((values: any[]) => {
      const [meters, uid] = values;
      if (!meters.length) {
        return new LoadFromDb(uid);
      }
      console.log("updating store from cache");
      return new AddMeters(meters);
    });

  /**
   * Handles effects to load data for given user using
   * database services.
   *
   * @memberof MainEffects
   */
  @Effect() public loadMetersData = this._actions$
    .ofType(LOAD_FROM_DB)
    .map((action: any) => action.payload)
    .switchMap(uid => {
      return this._db.getOrgPathForUser(uid);
    })
    .switchMap((orgPath: string) => {
      return this._db.getMetersForOrg(orgPath);
    })
    .switchMap((meters: IMeter[]) => {
      return this._db.getReadsForMeters(meters);
    })
    .switchMap((meters: IMeter[]) => {
      return this._db.getProviderForMeters(meters);
    })
    .map((meters: IMeter[]) => {
      // Sets sum of reads diffs to _usage property.
      this._helper.calcUsageDiffs(meters);

      // Sets actual usage cost to _actualUsageCost property.
      this._helper.calcUsageCost(meters);

      console.log("updating store from db");
      this._storage.set("metersTest", meters);

      // Dispatch action to update the store.
      return new AddMeters(meters);
    });

  /**
   * Creates an instance of MainEffects.
   * @param {Actions} _actions$
   * @param {DatabaseProvider} _db
   * @memberof MainEffects
   */
  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider,
    private readonly _helper: CostHelper,
    private readonly _storage: Storage
  ) { }

}
