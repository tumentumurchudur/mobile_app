import { ActionReducerMap } from "@ngrx/store";
import { IReads, IRead, IDateRange } from "../../interfaces";
import * as ActionTypes from "../actions";

export interface ReadsState {
	reads: {
		loading: boolean,
		data: IReads[] | null
	};
}

export const readsReducerMap: ActionReducerMap<ReadsState> = {
	reads: readsReducer
};

export function readsReducer(state = { data: [], loading: false }, action): any {
	switch (action.type) {
		case ActionTypes.ADD_READS:
			if (!action.payload) {
				return Object.assign({}, state, { loading: false });
			}

			const { guid = null, startDate = null, endDate = null } = action.payload;
			const filteredData = state.data.filter(s => {
				return s.guid !== guid ||
					s.startDate.toString() !== startDate.toString() ||
					s.endDate.toString() !== endDate.toString();
			});
			return Object.assign({}, state, { data: filteredData.concat(action.payload) }, { loading: false });
		case ActionTypes.LOADING_READS:
			return Object.assign({}, state, { loading: true });
		case ActionTypes.RESET_READS_TIMEOUT:
			const dateRange: IDateRange = action.payload.dateRange;
			const meterGuid = action.payload.guid;
			const reads = state.data as IReads[];

			// Finds current reads by guid and date range.
			const currentReadsData = reads.find(read => {
				return read.guid === meterGuid &&
					read.startDate.toString() === dateRange.startDate.toString() &&
					read.endDate.toString() === dateRange.endDate.toString();
			});

			if (!currentReadsData) {
				return state;
			}

			// Reset the timedOut property in current reads data.
			const newReadsData = Object.assign({}, currentReadsData, { timedOut: false });

			// Gets all reads data from the store except the current reads.
			const otherReadsData = reads.filter(d => {
				return d.guid !== newReadsData.guid ||
					d.startDate.toString() !== dateRange.startDate.toString() &&
					d.endDate.toString() !== dateRange.endDate.toString();
			});

			return Object.assign({}, state, { data: otherReadsData.concat(newReadsData) });
		default:
			return state;
	}
}
