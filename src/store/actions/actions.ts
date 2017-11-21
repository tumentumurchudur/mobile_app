import { Action } from '@ngrx/store';
import { IUser } from '../../interfaces';

export const LOAD_FROM_DB: string = "LOAD FROM DB";

export class LoadFromDb implements Action {
	public readonly type = LOAD_FROM_DB;
	public payload: IUser | null;

	constructor(private _payload: IUser) {
		this.payload = _payload;
	}
}
