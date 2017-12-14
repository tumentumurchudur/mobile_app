import { ActionReducerMap } from "@ngrx/store";
import { IReads, IRead, IReadSummaries } from '../../interfaces';
import * as ActionTypes from '../actions';

export interface ReadsState {
	reads: {
		loading: boolean,
		data: IReads[] | null
	}
}

export const readsReducerMap: ActionReducerMap<ReadsState> = {
	reads: readsReducer
}

export function readsReducer(state = { data: [], loading: false }, action): any {
	switch (action.type) {
		case ActionTypes.ADD_READS:
			const { guid = null, startDate = null, endDate = null } = action.payload;
			const filteredData = state.data.filter(s => {
				return s.guid !== guid ||
					s.startDate.toString() !== startDate.toString() ||
					s.endDate.toString() !== endDate.toString();
			});
			return Object.assign({}, state, { data: filteredData.concat(action.payload) }, { loading: false });
		case ActionTypes.LOADING_READS:
			return Object.assign({}, state, { loading: true });
		default:
			return state;
	}
}
