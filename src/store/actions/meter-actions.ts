import { Action } from '@ngrx/store';
import { IMeter, IUser } from '../../interfaces';

export const LOAD_METERS: string = "LOAD_METERS";

export const ADD_METERS: string = "ADD_METERS";
export const ADD_METER: string = "ADD_METER";

export const UPDATE_METER: string = "[Meter] UPDATE METER";
export const TRIGGER_UPDATE_METER_READS: string = "[Meter] TRIGGER UPDATE METER READS";
export const TRIGGER_UPDATE_METER_SETTINGS: string = "[Meter] TRIGGER UPDATE METER SETTINGS";

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
