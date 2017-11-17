import { Action } from '@ngrx/store';
import { IMeter, IUser } from '../../interfaces';

export const LOAD_METERS: string = "LOAD_METERS"
export const ADD_METERS: string = "ADD_METERS";
export const LOAD_FROM_DB: string = "LOAD FROM DB";
export const ADD_RATES: string = "ADD RATES";

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

export class LoadFromDb implements Action {
	public readonly type = LOAD_FROM_DB;
	public payload: IUser | null;

	constructor(private _payload: IUser) {
		this.payload = _payload;
	}
}

export class AddRates implements Action {
	public readonly type = ADD_RATES;
	public payload: any | null;

	constructor(private _payload: any) {
		this.payload = _payload;
	}
}


export type Actions = AddMeters | LoadMeters | LoadFromDb | AddRates;
