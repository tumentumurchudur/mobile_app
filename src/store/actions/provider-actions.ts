import { Action } from "@ngrx/store";

export const ADD_PROVIDERS: string = "ADD_PROVIDERS";

export const TRIGGER_ADD_PROVIDERS: string = "TRIGGER ADD PROVIDERS";
export const TRIGGER_GET_PROVIDER_COUNTRIES: string = "TRIGGER GET PROVIDER COUNTRIES";
export const TRIGGER_GET_PROVIDER_REGIONS: string = "TRIGGER UPDATE PROVIDER REGIONS";
export const TRIGGER_GET_PROVIDERS: string = "TRIGGER GET PROVIDERS";
export const TRIGGER_GET_PROVIDER_PLANS: string = "TRIGGER GET PROVIDER PLANS";

export const UPDATE_PROVIDER_COUNTRIES: string = "UPDATE PROVIDER COUNTRIES";
export const UPDATE_PROVIDERS: string = "UPDATE PROVIDERS";
export const RESET_PROVIDERS: string = "RESET PROVIDERS";
export const UPDATE_PROVIDER_PLANS: string = "UPDATE PROVIDER PLANS";
export const UPDATE_PROVIDER_REGIONS: string = "UPDATE PROVIDER REGIONS";

export class TriggerAddProviders implements Action {
  public readonly type = TRIGGER_ADD_PROVIDERS;
  public payload: any = null;

}

export class TriggerGetProviderCountries implements Action {
  public readonly type = TRIGGER_GET_PROVIDER_COUNTRIES;
  public payload: string = null;

  constructor(private _payload: string) {
    this.payload = _payload;
  }
}

export class TriggerGetProviderRegions implements Action {
  public readonly type = TRIGGER_GET_PROVIDER_REGIONS;
  public payload: any = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class TriggerGetProviders implements Action {
  public readonly type = TRIGGER_GET_PROVIDERS;
  public payload: any = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class TriggerGetProviderPlans implements Action {
  public readonly type = TRIGGER_GET_PROVIDER_PLANS;
  public payload: any = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class UpdateProviderCountries implements Action {
  public readonly type = UPDATE_PROVIDER_COUNTRIES;
  public payload: string[] = [];

  constructor(private _payload: string[]) {
    this.payload = _payload;
  }
}

export class UpdateProviderRegions implements Action {
  public readonly type = UPDATE_PROVIDER_REGIONS;
  public payload: string[] = [];

  constructor(private _payload: string[]) {
    this.payload = _payload;
  }
}

export class AddProviders implements Action {
  public readonly type = ADD_PROVIDERS;
  public payload: string[] = [];

  constructor(private _payload: string[]) {
    this.payload = _payload;
  }
}

export class UpdateProviderPlans implements Action {
  public readonly type = UPDATE_PROVIDER_PLANS;
  public payload: any = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class UpdateProviders implements Action {
  public readonly type = UPDATE_PROVIDERS;
  public payload: any = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class ResetProviders implements Action {
  public readonly type = RESET_PROVIDERS;
  public payload: any = null;

}

