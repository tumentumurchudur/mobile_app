import { Action } from '@ngrx/store';
import { IUser } from '../../interfaces';

export const ADD_USER: string = "ADD USER";
export const UPDATE_USER: string = "UPDATE USER";
export const TRIGGER_LOGOUT_USER: string = "TRIGGER LOGOUT USER";

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

export class TriggerCheckUser implements Action {
  public readonly type = UPDATE_USER;
  public payload: IUser | null;

  constructor(private _payload: IUser) {
    this.payload = _payload;
  }
}


export class TriggerLogoutUser implements Action {
  public readonly type = TRIGGER_LOGOUT_USER;
  public payload: IUser | null;

  constructor(private _payload: IUser) {
    this.payload = _payload;
  }
}

