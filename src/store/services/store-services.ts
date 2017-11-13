import { Injectable } from '@angular/core';
import { Store } from "@ngrx/store";
import { AppState } from "../reducers";
import { LoadMeters, LoadFromDb, AddUser, UpdateUser } from "../actions";
import { IUser } from "../../interfaces";

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

}
