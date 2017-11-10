import { Injectable } from '@angular/core';
import { Store } from "@ngrx/store";
import { AppState } from "../reducers";
import { LoadMeters } from "../actions";

@Injectable()
export class StoreServices {
	/**
	 * Creates an instance of StoreServices.
	 * @param {Store<AppState>} _store
	 * @memberof StoreServices
	 */
	constructor(
		private _store: Store<AppState>
	) { }

	/**
	 * Meter data is either loaded from cache or database.
	 *
	 * @param {string} uid
	 * @memberof StoreServices
	 */
	public loadMeters(uid: string) {
		this._store.dispatch(new LoadMeters((uid)));
	}

}
