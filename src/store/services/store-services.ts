import { Injectable } from '@angular/core';
import { Store } from "@ngrx/store";
import { AppState } from "../reducers";
import {
	LoadMeters,
	LoadFromDb,
	AddUser,
	UpdateUser,
	AddReads,
	LoadReadsFromDb,
	LoadSummariesFromDb,
	LoadingSummaries
} from "../actions";
import { IUser, IReads } from "../../interfaces";
import { Observable } from 'rxjs/Observable';
import { IMeter } from '../../interfaces/meter';

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

	public selectMeters() : Observable<IMeter[]> {
		return this._store.select(state => state.meters)
	}

	public addUser(user: IUser) {
		this._store.dispatch(new AddUser(user));
	}

	public updateUser(user: IUser) {
		this._store.dispatch(new UpdateUser(user));
	}

	public loadReadsFromDb(meters$: Observable<IMeter[]>) {
		let meters: IMeter[];

		meters$.subscribe(data => {
			meters = data;
		});
		this._store.dispatch(new LoadReadsFromDb(meters));
	}

	public addReads(reads: IReads[]) {
		this._store.dispatch(new AddReads(reads));
	}

	public loadSummariesFromDb(meters$: Observable<IMeter[]>, index: number, timeSpan: string) {
		let meter: IMeter;

		meters$.subscribe(meters => {
			meter = meters[index];
		});
		this._store.dispatch(new LoadingSummaries(true));
		this._store.dispatch(new LoadSummariesFromDb({ guid: meter._guid, timeSpan: timeSpan }));
	}

	public selectSummaryReads() {
		return this._store.select(state => state.summaries.data);
	}

	public selectLoadingSummariesFlag() {
		return this._store.select(state => state.summaries.loading);
	}
}
