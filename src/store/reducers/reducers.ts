import { ActionReducerMap } from "@ngrx/store";
import { IUser, IMeter } from '../../interfaces';
import * as ActionTypes from '../actions';
import { convertConfigs } from "../../configs";

export interface AppState {
    users: IUser[];
    meters: IMeter[];
}

export const reducers: ActionReducerMap<AppState> = {
    users: userReducer,
    meters: meterReducer
};

export function meterReducer(state = [], action) {
	switch (action.type) {
		case ActionTypes.ADD_METERS:
			return [...state, ...action.payload];
		case ActionTypes.CALC_METERS:
			const meters: IMeter[] = action.payload;

			meters.forEach(meter => {
				const reads = meter._reads;
				const calcData = [];

				for(let i = reads.length - 1; i >= 0; i--) {
					if (i - 1 >= 0) {
						calcData.push(
							reads[i].total - reads[i-1].total
						);
					}
				}
				meter._usage = calcData.reduce((a,b) => a + b);
			});

			return [...state, ...meters];
		default:
			return state;
	}
}

export function userReducer(state = [], action) {
	switch (action.type) {
			case ActionTypes.LOGGED_IN:
					return [...state, Object.assign({}, action.payload)];
			case ActionTypes.LOGGED_OUT:
					return [];
			default:
					return state;
	}
}
