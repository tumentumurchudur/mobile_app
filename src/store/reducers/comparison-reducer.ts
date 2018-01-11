import { ActionReducerMap } from "@ngrx/store";
import { IComparison } from "../../interfaces";
import * as ActionTypes from "../actions";

export interface ComparisonState {
	comparison: {
		loading: boolean,
		data: IComparison[] | null,
		neighborhoodGroup: any
	}
}

export const comparisonReducerMap: ActionReducerMap<ComparisonState> = {
	comparison: comparisonReducer
}

export function comparisonReducer(state = { data: [], loading: false, neighborhoodGroup: {} }, action): any {
	switch (action.type) {
		case ActionTypes.ADD_COMPARISON_READS:
			const { guid = null, startDate = null, endDate = null } = action.payload;
			const filteredData = state.data.filter(d => {
				return d.guid !== guid ||
					d.startDate.toString() !== startDate.toString() ||
					d.endDate.toString() !== endDate.toString();
			});

			return Object.assign({}, state, { data: filteredData.concat(action.payload) }, { loading: false });
		case ActionTypes.LOADING_COMPARISON_READS:
			return Object.assign({}, state, { loading: true });
		case ActionTypes.RESET_COMPARISON_TIMEOUT:
			const currentReads = state.data.find(d => {
				return d.guid === action.payload.guid ||
					d.startDate.toString() === action.payload.dateRange.startDate.toString() ||
					d.endDate.toString() === action.payload.dateRange.endDate.toString();
			});

			if (!currentReads) {
				return state;
			}

			const updatedReads = Object.assign({}, currentReads, { timedOut: false });
			const otherReads = state.data.filter(d => d.guid !== updatedReads.guid);

			return Object.assign({}, state, { data: otherReads.concat(updatedReads) });
		case ActionTypes.ADD_NEIGHBORHOOD_GROUP:
			return Object.assign({}, state, { neighborhoodGroup: action.payload });
		default:
			return state;
	}
}
