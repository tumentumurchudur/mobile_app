import { ActionReducerMap } from "@ngrx/store";
import { IReads, IReadSummaries } from '../../interfaces';
import * as ActionTypes from '../actions';

export interface ReadsState {
	reads: IReads[] | null,
	summaries: IReadSummaries[] | null
}

export const readsReducerMap: ActionReducerMap<ReadsState> = {
	reads: readsReducer,
	summaries: summariesReducer
}

export function readsReducer(state = [], action): any {
	switch (action.type) {
		case ActionTypes.ADD_READS:
			return [...action.payload];
		default:
			return state;
	}
}

	export function summariesReducer(state = [], action): IReadSummaries[] {
		switch (action.type) {
			case ActionTypes.ADD_SUMMARIES:
				const { guid = null } = action.payload;
				const filteredState = state.filter(s => s.guid !== guid);

				return filteredState.concat(action.payload);
			default:
				return state;
		}
}
