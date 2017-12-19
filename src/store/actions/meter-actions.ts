import { Action } from "@ngrx/store";
import { IMeter, IUser, IProvider } from "../../interfaces";

export const TRIGGER_LOAD_METERS: string = "[Meter] TRIGGER LOAD METERS";
export const LOAD_METERS: string = "[Meter] LOAD_METERS";

export const ADD_PROVIDERS: string = "ADD_PROVIDERS";
export const ADD_METERS: string = "ADD_METERS";
export const ADD_METER: string = "ADD_METER";

export const UPDATE_METER: string = "[Meter] UPDATE METER";
export const UPDATE_PROVIDER: string = "UPDATE PROVIDER";
export const UPDATE_PROVIDERS: string = "UPDATE PROVIDERS";
export const TRIGGER_ADD_PROVIDERS: string = "TRIGGER ADD PROVIDERS";
export const TRIGGER_UPDATE_PROVIDER_COUNTRIES: string = "TRIGGER UPDATE PROVIDER COUNTRIES";
export const TRIGGER_UPDATE_PROVIDER_REGIONS: string = "TRIGGER UPDATE PROVIDER REGIONS";
export const TRIGGER_GET_PROVIDERS: string = "TRIGGER GET PROVIDERS";
export const TRIGGER_GET_PROVIDER_PLANS: string = "TRIGGER GET PROVIDER PLANS";
export const UPDATE_PROVIDER_PLANS: string = "UPDATE PROVIDER PLANS";
export const UPDATE_PROVIDER_REGIONS: string = "UPDATE PROVIDER REGIONS";
export const TRIGGER_UPDATE_METER_READS: string = "[Meter] TRIGGER UPDATE METER READS";
export const TRIGGER_UPDATE_METER_SETTINGS: string = "[Meter] TRIGGER UPDATE METER SETTINGS";

export class TriggerLoadMeters implements Action {
	public readonly type = TRIGGER_LOAD_METERS;
	public payload: IUser | null;

	constructor(private _payload: IUser) {
		this.payload = _payload;
	}
}

export class LoadMeters implements Action {
	public readonly type = LOAD_METERS;
	public payload: IUser | null;

	constructor(private _payload: IUser) {
		this.payload = _payload;
	}
}

export class AddMeters implements Action {
	public readonly type = ADD_METERS;
	public payload: IMeter[] = null;

	constructor(private _payload: IMeter[]) {
		this.payload = _payload;
	}
}

export class AddMeter implements Action {
	public readonly type = ADD_METER;
	public payload: IMeter = null;

	constructor(private _payload: IMeter) {
		this.payload = _payload;
	}
}

export class TriggerAddProviders implements Action {
	public readonly type = TRIGGER_ADD_PROVIDERS;
	public payload = null;

}

export class TriggerUpdateProviderCountries implements Action {
  public readonly type = TRIGGER_UPDATE_PROVIDER_COUNTRIES;
  public payload = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class TriggerUpdateProviderRegions implements Action {
  public readonly type = TRIGGER_UPDATE_PROVIDER_REGIONS;
  public payload = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class TriggerGetProviders implements Action {
  public readonly type = TRIGGER_GET_PROVIDERS;
  public payload = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class TriggerGetProviderPlans implements Action {
  public readonly type = TRIGGER_GET_PROVIDER_PLANS;
  public payload = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class UpdateProviderPlans implements Action {
  public readonly type = UPDATE_PROVIDER_PLANS;
  public payload:any = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class UpdateProvider implements Action {
  public readonly type = UPDATE_PROVIDER;
  public payload:any = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class UpdateProviders implements Action {
  public readonly type = UPDATE_PROVIDERS;
  public payload:any = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

export class UpdateProviderRegion implements Action {
  public readonly type = UPDATE_PROVIDER_REGIONS;
  public payload:any = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

  export class AddProviders implements Action {
	public readonly type = ADD_PROVIDERS;
	public payload:any = null;

    constructor(private _payload: any) {
      this.payload = _payload;
    }
  }


export class UpdateMeter implements Action {
	public readonly type = UPDATE_METER;
	public payload: IMeter | null = null;

	constructor(private _payload: IMeter | null) {
		this.payload = _payload;
	}
}

export class TriggerUpdateMeterReads implements Action {
	public readonly type = TRIGGER_UPDATE_METER_READS;
	public payload: IMeter | null = null;

	constructor(private _payload: IMeter | null) {
		this.payload = _payload;
	}
}

export class TriggerUpdateMeterSettings implements Action {
	public readonly type = TRIGGER_UPDATE_METER_SETTINGS;
	public payload: { meter: IMeter, user: IUser } | null;

	constructor(private _payload: any) {
		this.payload = _payload;
	}
}
