import { ActionReducerMap } from "@ngrx/store";
import { IUser } from "../../interfaces";
import * as ActionTypes from "../actions";

export interface UserState {
	user: IUser | null;
}

export const userReducerMap: ActionReducerMap<UserState> = {
	user: userReducer
};

const userDefault: IUser = {
	email: null,
	uid: null,
	orgPath: null,
	password: null,
  providerData: null,
  authenticated: false
};

export function userReducer(state: IUser = userDefault, action): IUser {
	switch (action.type) {
		case ActionTypes.ADD_USER: {
			return action.payload;
		}
		case ActionTypes.UPDATE_USER: {
			return Object.assign({}, state, action.payload);
		}
    case ActionTypes.LOGOUT_USER: {
      return Object.assign({}, state, userDefault);
    }
		default:
			return state;
	}
}
