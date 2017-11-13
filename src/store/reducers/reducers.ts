import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import { IMeter, IUser, IRead } from '../../interfaces';
import * as ActionTypes from '../actions';
import { convertConfigs } from "../../configs";

import { storeFreeze } from 'ngrx-store-freeze';
import { environment } from '../../environments/environment'; // Angular CLI environment

export interface AppState {
	meters: IMeter[] | null;
	user: IUser | null,
	reads: [string, IRead][] | null // [meter_guid, IRead][]
}

export interface MeterState {
	meters: IMeter[] | null
}

export interface UserState {
	user: IUser | null
}

export const meterReducerMap: ActionReducerMap<MeterState> = {
	meters: meterReducer
}

export const userReducerMap: ActionReducerMap<UserState> = {
	user: userReducer
}

export const reducers: ActionReducerMap<AppState> = {
	meters: meterReducer,
	user: userReducer,
	// TODO: Implement reducer for reads.
	reads: null
};

export function meterReducer(state: IMeter[] = [], action): IMeter[] {
	switch (action.type) {
		case ActionTypes.ADD_METERS:
			return [...action.payload];
		default:
			return state;
	}
}

const userDefault: IUser = {
	email: null,
	uid: null,
	orgPath: null,
	password: null
}

export function userReducer(state: IUser = userDefault, action): IUser {
	switch(action.type) {
		case ActionTypes.ADD_USER: {
			return action.payload;
		}
		case ActionTypes.UPDATE_USER: {
			return Object.assign({}, state, action.payload);
		}
		default:
			return state;
	}
}

// TODO: We may use this in the future.
/**
 * When not in production, it is initialized with a meta reducer that prevents state from being mutated.
 * When mutation occurs, an exception will be thrown.
 */
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [storeFreeze] : [];

export function metaReducedMeterReducer(state, action) {
	const newState = meterReducer(state, action);

	// TODO: We can do other stuff here such as logging, etc.

	return newState;
}
