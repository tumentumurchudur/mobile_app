import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";
import { Storage } from "@ionic/storage";

import { Observable } from "rxjs/rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/observable/fromPromise";

import { DatabaseProvider } from "../../providers";
import { IMeter, IUser } from "../../interfaces";

import { CostHelper } from "../../helpers";
import {
  LOAD_METERS,
  TRIGGER_ADD_METER,
  TRIGGER_LOAD_METERS,
  TRIGGER_UPDATE_METER_SETTINGS,
  TRIGGER_VALIDATE_METER,

  AddMeter,
  AddMeters,
  AddMeterGuid,
  LoadMeters,
  TriggerUpdateMeterReads,
  ValidateMeterFail,
  LoadFromDb,
  UpdateUser,
  UpdateMeter
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
      return Observable.combineLatest(
        Observable.fromPromise(
          // Check if meter data is stored locally by uid as key.
          this._storage.get(user.uid).then(meters => {
            return meters && meters.length ? meters : [];
          })
        ),
        Observable.of(user)
      );
    })
    .map((values: any[]) => {
      const [meters = [], user] = values;

      return new LoadMeters(user);

      /**
       * TODO: Figure out a way to sync cache and store.
       * // Load data from API.
        if (!meters.length) {
          return new LoadFromDb(user);
        }

        // Load data from cache.
        return new AddMeters(meters);
       */
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
      this._storage.set(user.uid, newMeters);

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

      return this._db.updateMeterSettings(data.meter, data.user);
    })
    .map((meter: IMeter) => {
      return new TriggerUpdateMeterReads(meter);
    });

  /**
   * Handles ADD_METER action and
   * adds meter to the store.
   */
  @Effect()
  public addMeter$ = this._actions$
    .ofType(TRIGGER_ADD_METER)
    .map((action: any) => action.payload)
    .switchMap((data: any) => {
      const { meter = null, user = null } = data;
      console.log('data', data);

      return this._db.addMeter(data.meter, data.user);
    }).
      flatMap((meter: IMeter) => {
      return [
        new AddMeter(meter)
        // new UpdateMeter(meter)
      ]
    });

  /**
   * Handles VALIDATE_METER actions and
   * adds meterGuid to the state.provider.
   */
  @Effect()
  public validateMeter$ = this._actions$
    .ofType(TRIGGER_VALIDATE_METER)
    .map((action: any) => action.payload)
    .switchMap((meterId: string) => {
      return this._db.findMeterById(meterId);
    })
    .map((meterGuid) => {
      console.log('meterGUID', meterGuid);
      if (!meterGuid){
        return new ValidateMeterFail();
      }
      return new AddMeterGuid(meterGuid);
    });



  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider,
    private readonly _storage: Storage
  ) { }
}
