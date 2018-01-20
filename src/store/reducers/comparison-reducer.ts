import { ActionReducerMap } from "@ngrx/store";
import { IComparison, IDateRange } from "../../interfaces";
import * as ActionTypes from "../actions";

export interface ComparisonState {
	comparison: {
		loading: boolean,
		data: IComparison[] | null,
		neighborhoodGroup: any
	};
}

export const comparisonReducerMap: ActionReducerMap<ComparisonState> = {
	comparison: comparisonReducer
};

export function comparisonReducer(state = { data: [], loading: false, neighborhoodGroup: {} }, action): any {
	switch (action.type) {
		case ActionTypes.ADD_COMPARISON_READS:
			if (!action.payload) {
				return Object.assign({}, state, { data: state.data, loading : false });
			}

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
			const dateRange: IDateRange = action.payload.dateRange;
			const meterGuid = action.payload.guid;
			const comparisonReads: IComparison[] = state.data as IComparison[];

			const currentComparisonData: IComparison = comparisonReads.find(read => {
				return read.guid === meterGuid &&
					read.startDate.toString() === dateRange.startDate.toString() &&
					read.endDate.toString() === dateRange.endDate.toString();
			});

			if (!currentComparisonData) {
				return Object.assign({}, state);
			}

			const newComparisonData = Object.assign({}, currentComparisonData, { timedOut: false });
			const otherComparisonData = comparisonReads.filter(d => {
				return d.guid !== newComparisonData.guid ||
					d.startDate.toString() !== dateRange.startDate.toString() &&
					d.endDate.toString() !== dateRange.endDate.toString();
			});

			return Object.assign({}, state, { data: otherComparisonData.concat(newComparisonData) });
		case ActionTypes.ADD_NEIGHBORHOOD_GROUP:
			return Object.assign({}, state, { neighborhoodGroup: action.payload });
		default:
			return state;
	}
}
