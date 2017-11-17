import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import { IMeter, IUser, IRead, IRates } from '../../interfaces';

import { storeFreeze } from 'ngrx-store-freeze';
import { environment } from '../../environments/environment'; // Angular CLI environment

import { RatesState, ratesReducer } from "./rates-reducer";
import { MeterState, meterReducer } from "./meter-reducer";
import { UserState, userReducer } from "./user-reducer";

export interface AppState {
	meters: IMeter[] | null;
	user: IUser | null,
	reads: IRead[] | null,
	rates: IRates[] | null
}

export const reducers: ActionReducerMap<AppState> = {
	meters: meterReducer,
	user: userReducer,
	reads: null,
	rates: ratesReducer
};

// TODO: We may use this in the future.
/**
 * When not in production, it is initialized with a meta reducer that prevents state from being mutated.
 * When mutation occurs, an exception will be thrown.
 */
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [storeFreeze] : [];

export function metaReducedMeterReducer(state, action) {
	const newState = meterReducer(state, action);

	// TODO: We can do other stuff here such as logging, etc.

	return newState;
}
