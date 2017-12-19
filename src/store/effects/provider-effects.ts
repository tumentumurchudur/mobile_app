import { Injectable } from '@angular/core';
import { Effect, Actions } from "@ngrx/effects";
import { Storage } from "@ionic/storage";

import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/observable/fromPromise";

import { DatabaseProvider } from "../../providers";


import {
  TRIGGER_ADD_PROVIDERS,
  TRIGGER_UPDATE_PROVIDER_COUNTRIES,
  TRIGGER_UPDATE_PROVIDER_REGIONS,
  TRIGGER_GET_PROVIDERS,
  TRIGGER_GET_PROVIDER_PLANS,

  AddProviders,
  UpdateProvider,
  UpdateProviders,
  UpdateProviderPlans,
  UpdateProviderRegion,
} from "../actions";

@Injectable()
export class ProviderEffects {

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
    .switchMap((path) => {
    console.log(path);
      return this._db.getProviderRequestInfo(path);
    })
    .map((countries:any) => {
      return new UpdateProvider(countries);
    });

  @Effect()
  public updateProviderRegions$ = this._actions$
    .ofType(TRIGGER_UPDATE_PROVIDER_REGIONS)
    .map((action: any) => action.payload)
    .switchMap((path) => {
      return this._db.getProviderRequestInfo(path);
    })
    .map((regions:any) => {
      return new UpdateProviderRegion(regions);
    });

  @Effect()
  public updateProviders$ = this._actions$
    .ofType(TRIGGER_GET_PROVIDERS)
    .map((action: any) => action.payload)
    .switchMap((path) => {
      return this._db.getProviderRequestInfo(path);
    })
    .map((regions:any) => {
      return new UpdateProviders(regions);
    });

  @Effect()
  public updateProviderPlans$ = this._actions$
    .ofType(TRIGGER_GET_PROVIDER_PLANS)
    .map((action: any) => action.payload)
    .switchMap((path) => {
      return this._db.getProviderRequestInfo(path);
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
