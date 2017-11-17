import { Injectable } from '@angular/core';
import { Store } from "@ngrx/store";
import { AppState } from "../reducers";
import { LoadMeters, LoadFromDb, AddUser, UpdateUser, AddRates } from "../actions";
import { IUser, IRates } from "../../interfaces";
import { Observable } from 'rxjs/Observable';

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
	public loadMeters(user: IUser) {
		this._store.dispatch(new LoadMeters((user)));
	}

	public loadMetersFromDb(user: IUser) {
		this._store.dispatch(new LoadFromDb(user));
	}

	public addUser(user: IUser) {
		this._store.dispatch(new AddUser(user));
	}

	public updateUser(user: IUser) {
		this._store.dispatch(new UpdateUser(user));
	}

	public addRates(rates: IRates[]) {
		this._store.dispatch(new AddRates(rates));
	}

	public getRates(): Observable<IRates[]> {
		return this._store.select(state => state.rates);
	}

}
