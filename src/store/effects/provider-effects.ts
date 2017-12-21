import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";

import { DatabaseProvider } from "../../providers";

import {
  TRIGGER_ADD_PROVIDERS,
  TRIGGER_GET_PROVIDER_COUNTRIES,
  TRIGGER_GET_PROVIDER_REGIONS,
  TRIGGER_GET_PROVIDERS,
  TRIGGER_GET_PROVIDER_PLANS,

  AddProviders,
  ResetProvider,
  UpdateProviderCountries,
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
    .map((providersType: any) => {
      return new AddProviders(providersType);
    });

  @Effect()
  public getProviderCountries$ = this._actions$
    .ofType(TRIGGER_GET_PROVIDER_COUNTRIES)
    .map((action: any) => action.payload)
    .switchMap((utilityType: string) => {
          return this._db.getProviderRequestInfo(utilityType);
    })
    .flatMap((countries: string[]) => {
      return [
        new UpdateProviderCountries(countries)
      ]
    });

  @Effect()
  public getProviderRegions$ = this._actions$
    .ofType(TRIGGER_GET_PROVIDER_REGIONS)
    .map((action: any) => action.payload)
    .switchMap((path: string) => {
      return this._db.getProviderRequestInfo(path);
    })
    .map((regions: string[]) => {
      return new UpdateProviderRegion(regions);
    });

  @Effect()
  public getProviders$ = this._actions$
    .ofType(TRIGGER_GET_PROVIDERS)
    .map((action: any) => action.payload)
    .switchMap((path: string) => {
      return this._db.getProviderRequestInfo(path);
    })
    .map((regions: any) => {
      return new UpdateProviders(regions);
    });

  @Effect()
  public getProviderPlans$ = this._actions$
    .ofType(TRIGGER_GET_PROVIDER_PLANS)
    .map((action: any) => action.payload)
    .switchMap((path: string) => {
      return this._db.getProviderRequestInfo(path);
    })
    .map((plans: any) => {
      return new UpdateProviderPlans(plans);
    });

  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider
  ) { }
}
