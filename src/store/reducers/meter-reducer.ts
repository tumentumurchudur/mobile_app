import { ActionReducerMap } from "@ngrx/store";
import { IMeter } from '../../interfaces';
import * as ActionTypes from '../actions';

export interface MeterState {
	meters: {
		data: IMeter[] | null,
		loading: boolean
	}
}

export const meterReducerMap: ActionReducerMap<MeterState> = {
	meters: meterReducer
}

export function meterReducer(state = { data: [], loading: false }, action): any {
	switch (action.type) {
		case ActionTypes.ADD_METERS:
			return Object.assign({}, { data: action.payload });
		case ActionTypes.UPDATING_METER:
		  return Object.assign({}, state, { loading: true });
		case ActionTypes.UPDATE_METER:
			const { _guid } = action.payload;
			const filteredMeters = state.data.filter(meter => meter._guid !== _guid);
			const allMeters = sortByKey(Object.assign([], filteredMeters.concat(action.payload)), "_name");

		  return Object.assign({}, { data: allMeters, loading: false });
		default:
			return state;
	}
}

function sortByKey(array, key) {
	return array.sort(function(a, b) {
			var x = a[key]; var y = b[key];
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}
