import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import { IMeter, IUser, IReads, IReadSummaries } from '../../interfaces';

import { storeFreeze } from 'ngrx-store-freeze';
import { environment } from '../../environments/environment'; // Angular CLI environment

import { meterReducer } from "./meter-reducer";
import { userReducer } from "./user-reducer";
import { readsReducer, summariesReducer } from "./reads-reducer";

export interface AppState {
	meters: IMeter[] | null;
	user: IUser | null,
	reads: IReads[] | null,
	summaries: IReadSummaries[] | null
}

export const reducers: ActionReducerMap<AppState> = {
	meters: meterReducer,
	user: userReducer,
	reads: readsReducer,
	summaries: summariesReducer
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
