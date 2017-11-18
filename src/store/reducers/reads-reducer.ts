import { ActionReducerMap } from "@ngrx/store";
import { IReads } from '../../interfaces';
import * as ActionTypes from '../actions';

export interface ReadsState {
	reads: IReads[] | null
}

export const readsReducerMap: ActionReducerMap<ReadsState> = {
	reads: readsReducer
}

export function readsReducer(state: IReads[] = [], action): IReads[] {
	switch (action.type) {
    case ActionTypes.ADD_READS:
			return [...action.payload];
		default:
			return state;
	}
}
