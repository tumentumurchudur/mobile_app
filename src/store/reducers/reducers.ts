import { ActionReducerMap } from "@ngrx/store";
import { IUser, IMeter } from '../../interfaces';
import * as ActionTypes from '../actions';

export interface AppState {
    users: IUser[];
    meters: IMeter[];
}

export const reducers: ActionReducerMap<AppState> = {
    users: userReducer,
    meters: meterReducer
};

export function meterReducer(state = [], action) {
	switch (action.type) {
		case ActionTypes.ADD_METERS:
			return [...state, ...action.payload];
		default:
			return state;
	}
}

export function userReducer(state = [], action) {
	switch (action.type) {
			case ActionTypes.LOGGED_IN:
					return [...state, Object.assign({}, action.payload)];
			case ActionTypes.LOGGED_OUT:
					return [];
			default:
					return state;
	}
}
