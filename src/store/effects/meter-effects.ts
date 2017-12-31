import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";
import { Storage } from "@ionic/storage";
import * as moment from "moment";

import { Observable } from "rxjs/rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/observable/fromPromise";

import { DatabaseProvider } from "../../providers";
import { IMeter, IUser } from "../../interfaces";
import { environment } from "../../environments";

import { CostHelper } from "../../helpers";
import {
  LOAD_METERS,
  TRIGGER_LOAD_METERS,
  TRIGGER_UPDATE_METER_SETTINGS,
  TRIGGER_REMOVE_METER,

  AddMeters,
  RemoveMeter,
  LoadMeters,
  TriggerUpdateMeterReads,
  UpdateUser
} from "../actions";

@Injectable()
export class MeterEffects {
  /**
   * Handles load meters action.
   *
   * Updates the store with data from cache if found.
   * Otherwise, dispatch load from db action to fetch from the API.
   *
   * @memberof MainEffects
   */
  @Effect()
  public checkCacheAndThenLoadData$ = this._actions$
    .ofType(TRIGGER_LOAD_METERS)
    .map((action: any) => action.payload)
    .switchMap((user: IUser) => {
      return Observable.combineLatest([
        Observable.fromPromise(
          // Check if meter data is stored locally by uid as key.
          this._storage.get(user.uid).then(cachedData => {
            if (!cachedData) {
              return {};
            }
            return cachedData;
          })
        ),
        Observable.of(user)
      ]);
    })
    .map((values: any[]) => {
      const [ cachedData = null, user = null ] = values;
      const { meters = [], lastUpdatedDate = null } = cachedData;

      // Check if retention policy is expired.
      let cachePolicyExpired = false;
      if (lastUpdatedDate) {
        const { cacheDuration } = environment;

        cachePolicyExpired = moment(lastUpdatedDate).add(cacheDuration, "m").toDate() < new Date();
      }

      // Load data from API.
      if (!meters.length || !lastUpdatedDate || cachePolicyExpired) {
        return new LoadMeters(user);
      }

      // Load data from cache.
      return new AddMeters(meters);
    });

  /**
   * Handles load from database action.
   *
   * Fetches meter data from Firebase using uid.
   *
   * @memberof MainEffects
   */
  @Effect()
  public loadMetersDataFromDb$ = this._actions$
    .ofType(LOAD_METERS)
    .map((action: any) => action.payload)
    .switchMap((user: IUser) => {
      return Observable.combineLatest([
        this._db.getOrgPathForUser(user.uid),
        Observable.of(user)
      ]);
    })
    .switchMap((values: any[]) => {
      const [orgPath, user] = values;
      const updatedUser = Object.assign({}, user, { orgPath });

      return Observable.combineLatest([
        this._db.getMetersForOrg(orgPath),
        Observable.of(updatedUser)
      ]);
    })
    .switchMap((values: any[]) => {
      const [meters, user] = values;

      return Observable.combineLatest([
        this._db.getReadsForMeters(meters),
        Observable.of(user)
      ]);
    })
    .switchMap((values: any[]) => {
      const [meters, user] = values;

      return Observable.combineLatest([
        this._db.getProviderForMeters(meters),
        Observable.of(user)
      ]);
    })
    .flatMap((values: any[]) => {
      const [meters, user] = values;

      // Calculates actual cost and usage.
      const newMeters = CostHelper.calculateCostAndUsageForMeters(meters);

      // Store meter data locally by uid as key.
      this._storage.set(user.uid, {
        meters: newMeters,
        lastUpdatedDate: new Date()
      });

      // Dispatch actions to update the store.
      return [
        new AddMeters(newMeters),
        new UpdateUser(user)
      ];
    });

  /**
   * Handles TRIGGER_UPDATE_METER_SETTINGS action and
   * updates meter settings in the store.
   */
  @Effect()
  public updateMeterSettings$ = this._actions$
    .ofType(TRIGGER_UPDATE_METER_SETTINGS)
    .map((action: any) => action.payload)
    .switchMap((data: any) => {
      const { meter = null, user = null } = data;

      return Observable.combineLatest([
        this._db.updateMeterSettings(data.meter, data.user),
        Observable.of(user)
      ]);
    })
    .map((data: any[]) => {
      const [meter, user] = data;

      // Refreshes reads for this meter.
      return new TriggerUpdateMeterReads({ meter, user });
    });

  @Effect()
  public removeMeter$ = this._actions$
    .ofType(TRIGGER_REMOVE_METER)
    .map((action: any) => action.payload)
    .switchMap(({ meter, user }) => {
      return this._db.deleteMeter(meter, user);
    })
    .map((meter: IMeter) => {
      return new RemoveMeter(meter);
    });

  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider,
    private readonly _storage: Storage
  ) { }
}
