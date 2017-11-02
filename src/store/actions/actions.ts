import { Action } from '@ngrx/store';
import { IUser, IMeter } from '../../interfaces';

export const LOGGED_IN: string = 'LOGGED_IN';
export const LOGGED_OUT: string = 'LOGGED_OUT';
export const LOAD_METERS: string = "LOAD_METERS"
export const ADD_METERS: string = "ADD_METERS";
export const CALC_METERS: string = "CALC_METER";
export const CALC_GOAL: string = "CALC_GOAL";
export const CALC_USAGE: string = "CALC_USAGE";

export class UserLoggedIn implements Action {
	public readonly type = LOGGED_IN;
	public payload: IUser | null;

	constructor(private _payload: IUser) {
			this.payload = _payload;
	}
}

export class LoadMeters implements Action {
	public readonly type = LOAD_METERS;
	public payload: string = null;

	constructor(private _payload: string) {
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

export class CalcMeters implements Action {
	public readonly type = CALC_METERS;
	public payload: IMeter[] = null;

	constructor(private _payload: IMeter[]) {
		this.payload = _payload;
	}
}

export class CalcMeterGoal implements Action {
	public readonly type = CALC_GOAL;
	public payload: IMeter[] = null;

	constructor(private _payload: IMeter[]) {
		this.payload = _payload;
	}
}

export class CalcMeterUsage implements Action {
	public readonly type = CALC_USAGE;
	public payload: IMeter[] = null;

	constructor(private _payload: IMeter[]) {
		this.payload = _payload;
	}
}


export type Actions = UserLoggedIn | LoadMeters;
