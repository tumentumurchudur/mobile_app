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
	LoadReadsByDateRange,
	LoadingReads,
	LoadSummaries,
	LoadingSummaries
} from "../actions";
import { IUser, IReads } from "../../interfaces";
import { Observable } from 'rxjs/Observable';
import { IMeter } from '../../interfaces/meter';
import { UpdatingMeter } from '../actions/meter-actions';

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

	public updateMeterReads(meter: IMeter) {
		// Update reads for given meter.
		this._store.dispatch(new UpdatingMeter(meter));
	}

	public selectMeterLoading(): Observable<boolean> {
		return this._store.select(state => state.meters.loading);
	}

	public loadMetersFromDb(user: IUser) {
		this._store.dispatch(new LoadFromDb(user));
	}

	public selectMeters() : Observable<IMeter[]> {
		return this._store.select(state => state.meters.data)
	}

	public addUser(user: IUser) {
		this._store.dispatch(new AddUser(user));
	}

	public updateUser(user: IUser) {
		this._store.dispatch(new UpdateUser(user));
	}

	public updateAllMetersReads(meters$: Observable<IMeter[]>) {
		meters$.take(1).subscribe((meters: IMeter[]) => {
			// Set loading to true in the store.
			this._store.dispatch(new UpdatingMeter(null));

			// Update reads for every meter.
			this._store.dispatch(new LoadReadsFromDb(meters));
		});
	}

	public addReads(reads: IReads) {
		this._store.dispatch(new AddReads(reads));
	}

	public loadReadsByDateRange(meter: IMeter, timeSpan: string, startDate: Date, endDate: Date) {
		this._store.dispatch(new LoadingReads());
		this._store.dispatch(new LoadReadsByDateRange({ meter, timeSpan, startDate, endDate }));
	}

	public selectReadsLoading() {
		return this._store.select(state => state.reads.loading);
	}

	public selectReadsData() {
		return this._store.select(state => state.reads.data);
	}

}
