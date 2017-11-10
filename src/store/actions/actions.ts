import { Action } from '@ngrx/store';
import { IMeter } from '../../interfaces';

export const LOAD_METERS: string = "LOAD_METERS"
export const ADD_METERS: string = "ADD_METERS";
export const LOAD_FROM_DB: string = "LOAD FROM DB";

export class LoadMeters implements Action {
	public readonly type = LOAD_METERS;
	public payload: string | null;

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

export class LoadFromDb implements Action {
	public readonly type = LOAD_FROM_DB;
	public payload: string | null;

	constructor(private _payload: string) {
		this.payload = _payload;
	}
}


export type Actions = AddMeters | LoadMeters;
