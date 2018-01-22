import { Action } from "@ngrx/store";
import { IUser } from "../../interfaces";

export const ADD_USER: string = "ADD USER";
export const UPDATE_USER: string = "UPDATE USER";
export const LOGOUT_USER: string = "LOGOUT USER";
export const RESET_PASSWORD: string = "RESET PASSWORD";
export const TRIGGER_PREP_FOR_LOGOUT: string = "TRIGGER PREP FOR LOGOUT";
export const TRIGGER_USER_CHECK: string = "TRIGGER USER CHECK";

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

export class TriggerUserCheck implements Action {
  public readonly type = TRIGGER_USER_CHECK;
  public payload: IUser | null;

  constructor(private _payload: IUser) {
    this.payload = _payload;
  }
}

export class TriggerPrepForLogout implements Action {
  public readonly type = TRIGGER_PREP_FOR_LOGOUT;
  public payload: any;
}

export class LogoutUser implements Action {
  public readonly type = LOGOUT_USER;
  public payload: string;
}

export class ResetPassword implements Action {
  public readonly type = RESET_PASSWORD;
  public payload: any = null;

  constructor(private _payload: any) {
    this.payload = _payload;
  }
}

