import { Action } from '@ngrx/store';
import { IUser } from '../../interfaces';

export const ADD_USER: string = "ADD USER";
export const UPDATE_USER: string = "UPDATE USER";

export class AddUser implements Action {
	public readonly type = ADD_USER;
	public payload: IUser | null;

	constructor(private _payload: IUser) {
		this.payload = _payload;
	}
}

export class UpdateUser implements Action {
	public readonly type = UPDATE_USER;
	public payload: IUser | null;

	constructor(private _payload: IUser) {
		this.payload = _payload;
	}
}
