import { ActionReducerMap } from "@ngrx/store";
import { IMeter } from '../../interfaces';
import * as ActionTypes from '../actions';
import { IProvider } from "../../interfaces/provider";

export interface MeterState {
	meters: {
		data: IMeter[] | null,
		loading: boolean,
    providerType: any,
    regions: any,
    provider: IProvider,
    plans: any
	}
}

export const meterReducerMap: ActionReducerMap<MeterState> = {
	meters: meterReducer
}

export function meterReducer(state = { data: [], provider: {}, loading: false}, action): any {
	switch (action.type) {
		case ActionTypes.ADD_METERS:
	    return Object.assign({}, state, { data: action.payload, loading: false });
		case ActionTypes.ADD_METER:
			return Object.assign({}, state, { data: state.data.concat(action.payload), loading: false });
		case ActionTypes.REMOVE_METER:
			const meterToRemove = action.payload;
			const meters = state.data.filter((meter: IMeter) => {
				return meter._guid !== meterToRemove._guid || meter._name !== meterToRemove._name;
			});

			return Object.assign({}, state, { data: meters });
    case ActionTypes.ADD_PROVIDERS:
      return Object.assign({}, state, { providerType: action.payload });
    case ActionTypes.UPDATE_PROVIDER_COUNTRIES:
      const newProviderCountries = Object.assign({}, state.provider, { countries: action.payload });

      return Object.assign({}, state, { provider: newProviderCountries });
    case ActionTypes.UPDATE_PROVIDER_REGIONS:
      const newProviderRegions = Object.assign({}, state.provider, { regions: action.payload });

      return Object.assign({}, state, { provider: newProviderRegions });
    case ActionTypes.UPDATE_PROVIDERS:
      const newProviderProviders = Object.assign({}, state.provider, { providers: action.payload });

      return Object.assign({}, state, { provider: newProviderProviders });
    case ActionTypes.UPDATE_PROVIDER_PLANS:
      const newProviderPlans = Object.assign({}, state.provider, { plans: action.payload });

      return Object.assign({}, state, { provider: newProviderPlans });
    case ActionTypes.RESET_PROVIDER:
      return Object.assign({}, state, { provider: {} });
    case ActionTypes.TRIGGER_UPDATE_METER_READS:
		case ActionTypes.TRIGGER_UPDATE_METER_SETTINGS:
		  return Object.assign({}, state, { loading: true });
		case ActionTypes.UPDATE_METER:
		  if (!action.payload) {
			return state;
			}

			const { _guid } = action.payload;
			const filteredMeters = state.data.filter(meter => meter._guid !== _guid);
			const allMeters = sortByKey(Object.assign([], filteredMeters.concat(action.payload)), "_name");

			return Object.assign({}, state, { data: allMeters, loading: false });
		default:
			return state;
	}
}

function sortByKey(array: any[], key: string): any[] {
	return array.sort((a, b) => {
		const x = a[key];
		const y = b[key];

		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}
