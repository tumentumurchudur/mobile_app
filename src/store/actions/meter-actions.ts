import { Action } from '@ngrx/store';
import { IMeter, IUser } from '../../interfaces';

export const LOAD_METERS: string = "LOAD_METERS";

export const ADD_METERS: string = "ADD_METERS";
export const ADD_METER: string = "ADD_METER";

export const UPDATE_METER: string = "UPDATE METER";
export const UPDATING_METER: string = "UPDATING METER";
export const UPDATE_METER_SETTINGS: string = "UPDATE METER SETTINGS";

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

export class UpdatingMeter implements Action {
	public readonly type = UPDATING_METER;
	public payload: IMeter | null = null;

	constructor(private _payload: IMeter | null) {
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

export class UpdateSettings implements Action {
	public readonly type = UPDATE_METER_SETTINGS;
	public payload: { meter: IMeter, user: IUser } | null;

	constructor(private _payload: any) {
		this.payload = _payload;
	}
}
