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
			const meters: IMeter[] = Object.assign([], action.payload);

			// Calculates consumption data from meter._reads array.
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

			return meters;
		case ActionTypes.CALC_GOAL: {
			const meters: IMeter[] = Object.assign([], action.payload);

			for(let i = 0; i <= meters.length - 1; i++) {
				const today = new Date();
				const summer = meters[i]._summer;
				const winter = meters[i]._winter;
				const startDate = summer ? new Date(summer.start_date + "/" + today.getFullYear()) : null;
				const endDate = summer ? new Date(summer.end_date + "/" + today.getFullYear()) : null;
				const isSummer = startDate && endDate ? today >= startDate && today < endDate : false;
				const tiers = isSummer && summer ? summer.tiers : (winter ? winter.tiers : null);
				let usage = 0;

				if (meters[i]._utilityType === "gas") {
					usage = meters[i]._usage / convertConfigs.ccfToDth;
				} else if (meters[i]._utilityType === "water") {
					usage = meters[i]._usage / convertConfigs.galToCcf;
				} else {
					usage = meters[i]._usage;
				}

				if (tiers) {
					const rate = [];
					let curr = 0;
					let next = 1;
					let total = 0;

					for (let key of Object.keys(tiers)) {
						rate.push({
						  tier: key,
						  rate: tiers[key]
						});
					}

					while(next < rate.length) {
					  if(usage > rate[next].tier) {
						total += (rate[next].tier - rate[curr].tier) * rate[curr].rate
					  } else {
						total += (usage - rate[curr].tier) * rate[curr].rate
					  }
					  curr++;
					  next++;
					}
					meters[i]._actualUsageCost = total + meters[i]._facilityFee;
					console.log("usage =>", usage, total, tiers);
				}
			}
			console.log("new state", meters);
			return meters;
		}
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
