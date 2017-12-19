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
  TRIGGER_LOAD_METERS,
  TRIGGER_UPDATE_METER_SETTINGS,
  TRIGGER_ADD_PROVIDERS,
  TRIGGER_UPDATE_PROVIDER_COUNTRIES,
  TRIGGER_GET_PROVIDERS,
  TRIGGER_GET_PROVIDER_PLANS,

  AddMeters,
  LoadMeters,
  TriggerUpdateMeterReads,
  LoadFromDb,
  AddProviders,
  UpdateProvider,
  UpdateProviders,
  UpdateProviderPlans,
  UpdateProviderRegion,
  TriggerUpdateProviderCountries,
  UpdateUser
} from "../actions";
import {TRIGGER_UPDATE_PROVIDER_REGIONS} from "../actions/meter-actions";

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
   * Handles GetProviders action.
   */
  @Effect()
  public addProviders$ = this._actions$
    .ofType(TRIGGER_ADD_PROVIDERS)
    .switchMap(() => {
      return this._db.getProviderTypes();
    })
    .map((providersType:any) => {
      return new AddProviders(providersType);
    });

  @Effect()
  public updateProviderCountries$ = this._actions$
    .ofType(TRIGGER_UPDATE_PROVIDER_COUNTRIES)
    .map((action: any) => action.payload)
    .switchMap((utilityType) => {
      return this._db.getProviderCountries(utilityType);
    })
    .map((countries:any) => {
      return new UpdateProvider(countries);
    });

  @Effect()
  public updateProviderRegions$ = this._actions$
    .ofType(TRIGGER_UPDATE_PROVIDER_REGIONS)
    .map((action: any) => action.payload)
    .switchMap((path) => {
      return this._db.getProviderRegions(path);
    })
    .map((regions:any) => {
      return new UpdateProviderRegion(regions);
    });

  @Effect()
  public updateProviders$ = this._actions$
    .ofType(TRIGGER_GET_PROVIDERS)
    .map((action: any) => action.payload)
    .switchMap((path) => {
      return this._db.getProviders(path);
    })
    .map((regions:any) => {
      return new UpdateProviders(regions);
    });

  @Effect()
  public updateProviderPlans$ = this._actions$
    .ofType(TRIGGER_GET_PROVIDER_PLANS)
    .map((action: any) => action.payload)
    .switchMap((path) => {
      return this._db.getProviderPlans(path);
    })
    .map((plans:any) => {
      return new UpdateProviderPlans(plans);
    });


  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider,
    private readonly _storage: Storage
  ) { }
}
