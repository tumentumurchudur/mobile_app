import { Action } from "@ngrx/store";
import { IMeter, IUser } from "../../interfaces";

export const TRIGGER_LOAD_METERS: string = "[Meter] TRIGGER LOAD METERS";
export const LOAD_METERS: string = "[Meter] LOAD_METERS";

export const ADD_METERS: string = "ADD_METERS";
export const ADD_METER: string = "ADD_METER";
export const ADD_METER_GUID: string = "ADD METER GUID";

export const UPDATE_METER: string = "[Meter] UPDATE METER";
export const TRIGGER_ADD_METER: string = "TRIGGER ADD METER";
export const TRIGGER_UPDATE_METER_READS: string = "[Meter] TRIGGER UPDATE METER READS";
export const TRIGGER_UPDATE_METER_SETTINGS: string = "[Meter] TRIGGER UPDATE METER SETTINGS";
export const TRIGGER_VALIDATE_METER: string = "TRIGGER VALIDATE METER";
export const VALIDATE_METER_FAIL: string = "VALIDATE METER FAIL";

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

export class UpdateMeter implements Action {
	public readonly type = UPDATE_METER;
	public payload: IMeter | null = null;

	constructor(private _payload: IMeter | null) {
		this.payload = _payload;
	}
}

export class AddMeterGuid implements Action {
  public readonly type = ADD_METER_GUID;
  public payload: string  = null;

  constructor(private _payload: string) {
    this.payload = _payload;
  }
}

export class TriggerAddMeter implements Action {
  public readonly type = TRIGGER_ADD_METER;
  public payload: { meter: IMeter, user: IUser } = null;

  constructor(private _payload: any) {
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

export class TriggerValidateMeter implements Action {
  public readonly type = TRIGGER_VALIDATE_METER;
  public payload: string = null;

  constructor(private _payload: string) {
    this.payload = _payload;
  }
}

export class ValidateMeterFail implements Action {
  public readonly type = VALIDATE_METER_FAIL;
  public payload: any = null;

}


