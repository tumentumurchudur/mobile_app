import { ActionReducerMap } from "@ngrx/store";
import { IMeter } from '../../interfaces';
import * as ActionTypes from '../actions';
import { convertConfigs } from "../../configs";

export interface AppState {
  meters: IMeter[];
}

export const reducers: ActionReducerMap<AppState> = {
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
