import { ActionReducerMap } from "@ngrx/store";
import * as ActionTypes from '../actions';
import { IProvider } from "../../interfaces/provider";

export interface ProviderState {
  providers: {
    providerTypes: string[],
    provider: IProvider | null
  }
}

export const providerReducerMap: ActionReducerMap<ProviderState> = {
  providers: providerReducer
}

export function providerReducer(state = { providerTypes: [], provider: {} }, action): any {
  switch (action.type) {
    case ActionTypes.ADD_METER_GUID:
      const newValidMeter = Object.assign({}, state.provider, { guid: action.payload });

      return Object.assign({}, state, { provider: newValidMeter});
    case ActionTypes.ADD_PROVIDERS:
      return Object.assign({}, state, {providerTypes: action.payload});
    case ActionTypes.UPDATE_PROVIDER_COUNTRIES:
      const newProviderCountries = Object.assign({}, state.provider, {countries: action.payload});

      return Object.assign({}, state, {provider: newProviderCountries});
    case ActionTypes.UPDATE_PROVIDER_REGIONS:
      const newProviderRegions = Object.assign({}, state.provider, {regions: action.payload});

      return Object.assign({}, state, {provider: newProviderRegions});
    case ActionTypes.UPDATE_PROVIDERS:
      const newProviderProviders = Object.assign({}, state.provider, {providers: action.payload});

      return Object.assign({}, state, {provider: newProviderProviders});
    case ActionTypes.UPDATE_PROVIDER_PLANS:
      const newProviderPlans = Object.assign({}, state.provider, {plans: action.payload});

      return Object.assign({}, state, {provider: newProviderPlans});
    case ActionTypes.RESET_PROVIDER:
      return Object.assign({}, state, {provider: {}});
    default:
      return state;
  }
}
