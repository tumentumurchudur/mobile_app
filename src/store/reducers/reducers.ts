import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import { IMeter } from '../../interfaces';
import * as ActionTypes from '../actions';
import { convertConfigs } from "../../configs";

import { storeFreeze } from 'ngrx-store-freeze';
import { environment } from '../../environments/environment'; // Angular CLI environment

export interface AppState {
	meters: IMeter[];
}

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [storeFreeze] : [];

export const reducers: ActionReducerMap<AppState> = {
	meters: metaReducedMeterReducer
};

const defaultState = (() => {
	return [];
})();

export function meterReducer(state = defaultState, action) {
	switch (action.type) {
		case ActionTypes.ADD_METERS:
			console.log("add meters", action.payload);
			return [...action.payload];
		// case ActionTypes.LOAD_METERS:
		// 	console.log("load meters", action.payload);
		// 	return [...action.payload];
		default:
			return state;
	}
}

export function metaReducedMeterReducer(state, action) {
	const newState = meterReducer(state, action);

	// TODO: Save new state to local storage here.

	return newState;
}
