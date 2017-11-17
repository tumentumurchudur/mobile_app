import { ActionReducerMap } from "@ngrx/store";
import { IRates } from '../../interfaces';
import * as ActionTypes from '../actions';

export interface RatesState {
	rates: IRates[] | null
}

export const ratesReducerMap: ActionReducerMap<RatesState> = {
	rates: ratesReducer
}

export function ratesReducer(state: IRates[] = [], action): IRates[] {
	switch(action.type) {
		case ActionTypes.ADD_RATES:
			return [...action.payload];
		default:
			return state;
	}
}
