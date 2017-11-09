import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import { IMeter } from '../../interfaces';
import * as ActionTypes from '../actions';
import { convertConfigs } from "../../configs";

import { storeFreeze } from 'ngrx-store-freeze';
import { environment } from '../../environments/environment'; // Angular CLI environment

export interface AppState {
  meters: IMeter[];
}

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [storeFreeze]: [];

export const reducers: ActionReducerMap<AppState> = {
  meters: meterReducer
};

export function meterReducer(state = [], action) {
	switch (action.type) {
		case ActionTypes.ADD_METERS:
			return [...action.payload];
		default:
			return state;
	}
}
