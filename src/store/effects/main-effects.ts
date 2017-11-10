import { Injectable } from '@angular/core';
import { Effect, Actions } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import { Storage } from "@ionic/storage";

import { Observable } from "rxjs/rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/observable/fromPromise";

import { LOAD_METERS, LOAD_FROM_DB, AddMeters, LoadFromDb } from "../actions";
import { DatabaseProvider } from "../../providers";
import { IMeter } from "../../interfaces";

import { CostHelper } from "../../helpers";

@Injectable()
export class MainEffects {
  /**
   * Handles load meters action.
   *
   * Updates the store with data from cache if found.
   * Otherwise, dispatch load from db action to fetch from the API.
   *
   * @memberof MainEffects
   */
  @Effect() public checkCacheAndThenLoadData = this._actions$
    .ofType(LOAD_METERS)
    .map((action: any) => action.payload)
    .switchMap((uid: string) => {
      return Observable.combineLatest(
        Observable.fromPromise(
          // Check if meter data is stored locally by uid as key.
          this._storage.get(uid).then(meters => {
            return meters && meters.length ? meters : [];
          })
        ),
        Observable.of(uid)
      );
    })
    .map((values: any[]) => {
      const [meters = [], uid] = values;

      // Load data from API.
      if (!meters.length) {
        return new LoadFromDb(uid);
      }
      return new AddMeters(meters);
    });

  /**
   * Handles load from database action.
   *
   * Fetches meter data from Firebase using uid.
   *
   * @memberof MainEffects
   */
  @Effect() public loadMetersDataFromDb = this._actions$
    .ofType(LOAD_FROM_DB)
    .map((action: any) => action.payload)
    .switchMap((uid: string) => {
      return Observable.combineLatest([
        this._db.getOrgPathForUser(uid),
        Observable.of(uid)
      ]);
    })
    .switchMap((values: any[]) => {
      const [orgPath, uid] = values;

      return Observable.combineLatest([
        this._db.getMetersForOrg(orgPath),
        Observable.of(uid)
      ]);
    })
    .switchMap((values: any[]) => {
      const [meters, uid] = values;

      return Observable.combineLatest([
        this._db.getReadsForMeters(meters),
        Observable.of(uid)
      ]);
    })
    .switchMap((values: any[]) => {
      const [meters, uid] = values;

      return Observable.combineLatest([
        this._db.getProviderForMeters(meters),
        Observable.of(uid)
      ]);
    })
    .map((values: any[]) => {
      const [meters, uid] = values;

      // Sets sum of reads diffs to _usage property.
      this._helper.calcUsageDiffs(meters);

      // Sets actual usage cost to _actualUsageCost property.
      this._helper.calcUsageCost(meters);

      // Store meter data locally by uid as key.
      this._storage.set(uid, meters);

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
