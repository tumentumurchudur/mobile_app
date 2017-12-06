import { ActionReducerMap } from "@ngrx/store";
import { IMeter } from '../../interfaces';
import * as ActionTypes from '../actions';

export interface MeterState {
	meters: IMeter[] | null
}

export const meterReducerMap: ActionReducerMap<MeterState> = {
	meters: meterReducer
}

export function meterReducer(state: IMeter[] = [], action): IMeter[] {
	switch (action.type) {
		case ActionTypes.ADD_METERS:
			return [...action.payload];
    case ActionTypes.ADD_METER:
      return state.concat(action.payload);
		default:
			return state;
	}
}
