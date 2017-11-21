import { ActionReducerMap } from "@ngrx/store";
import { IReads, IReadSummaries } from '../../interfaces';
import * as ActionTypes from '../actions';

export interface ReadsState {
	reads: IReads[] | null,
	summaries: {
		loading: boolean,
		data: IReadSummaries[] | null
	}
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

	export function summariesReducer(state = { data: [], loading: true }, action) {
		switch (action.type) {
			case ActionTypes.ADD_SUMMARIES:
				const { guid = null, timeSpan = null } = action.payload;
				const filteredData = state.data.filter(s => s.guid !== guid && s.timeSpan !== timeSpan);

				return Object.assign({}, state, { data: filteredData.concat(action.payload) }, { loading: false });
			case ActionTypes.LOADING_SUMMARIES: {
				return Object.assign({}, state, { loading: true });
			}
			default:
				return state;
		}
}
