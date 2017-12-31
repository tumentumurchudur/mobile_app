import { Action } from "@ngrx/store";
import { IMeter, IUser } from "../../interfaces";

export const TRIGGER_LOAD_METERS: string = "[Meter] TRIGGER LOAD METERS";
export const LOAD_METERS: string = "[Meter] LOAD METERS";
export const UPDATE_LAST_UPDATED_DATE: string = "[Meter] UPDATE LAST UPDATED DATE";

export const ADD_METERS: string = "[Meter] ADD METERS";
export const ADD_METER: string = "[Meter] ADD METER";
export const REMOVE_METER: string = "[Meter] REMOVE METER";

export const UPDATE_METER: string = "[Meter] UPDATE METER";
export const TRIGGER_UPDATE_METER_READS: string = "[Meter] TRIGGER UPDATE METER READS";
export const TRIGGER_UPDATE_METER_SETTINGS: string = "[Meter] TRIGGER UPDATE METER SETTINGS";
export const TRIGGER_REMOVE_METER: string = "[Meter] TRIGGER REMOVE METER";

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

export class RemoveMeter implements Action {
	public readonly type = REMOVE_METER;
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

export class UpdateLastUpdatedDate implements Action {
	public readonly type = UPDATE_LAST_UPDATED_DATE;
	public payload: Date | null = null;

	constructor(private _payload: Date | null) {
		this.payload = _payload;
	}
}

export class TriggerUpdateMeterReads implements Action {
	public readonly type = TRIGGER_UPDATE_METER_READS;
	public payload: { meter: IMeter, user: IUser } = null;

	constructor(private _payload: { meter: IMeter, user: IUser }) {
		this.payload = _payload;
	}
}

export class TriggerUpdateMeterSettings implements Action {
	public readonly type = TRIGGER_UPDATE_METER_SETTINGS;
	public payload: { meter: IMeter, user: IUser } | null;

	constructor(private _payload: { meter: IMeter, user: IUser }) {
		this.payload = _payload;
	}
}

export class TriggerRemoveMeter implements Action {
	public readonly type = TRIGGER_REMOVE_METER;
	public payload: { meter: IMeter, user: IUser } | null;

	constructor(private _payload: { meter: IMeter, user: IUser }) {
		this.payload = _payload;
	}
}
