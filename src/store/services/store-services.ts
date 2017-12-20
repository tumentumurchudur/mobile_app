import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../reducers";
import { IUser, IReads, IMeter, IDateRange } from "../../interfaces";
import { Observable } from "rxjs/Observable";
import {
	AddMeter,
	UpdateMeter,
	LoadMeters,
  AddProviders,
	LoadFromDb,
	TriggerAddProviders,
  TriggerGetProviderCountries,
  TriggerGetProviderRegions,
  TriggerGetProviders,
  TriggerGetProviderPlans,
	AddUser,
	UpdateUser,
	TriggerLoadMeters,
	TriggerUpdateMeterReads,
	TriggerUpdateMeterSettings,
	TriggerComparisonReads,
	AddReads,
	LoadReadsByDateRange,
	LoadingReads,
	LoadReadsByMeters,
	LoadingComparisonReads
} from "../actions";
import {IProvider} from "../../interfaces/provider";

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
		this._store.dispatch(new TriggerLoadMeters(user));
	}

	public updateMeterReads(meter: IMeter) {
		// Update reads for given meter.
		this._store.dispatch(new TriggerUpdateMeterReads(meter));
	}

	public updateMeterSettings(meter: IMeter, user: IUser) {
		this._store.dispatch(new TriggerUpdateMeterSettings({ meter, user }));
	}

	public selectMeterLoading(): Observable<boolean> {
		return this._store.select(state => state.meters.loading);
	}

  public addMeter(meter: IMeter) {
    this._store.dispatch(new AddMeter(meter));
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
			this._store.dispatch(new TriggerUpdateMeterReads(null));

			// Update reads for every meter.
			this._store.dispatch(new LoadReadsByMeters(meters));
		});
	}

	public updateLoaderWhenReadsDone(refresher: any) {
		this.selectMeterLoading().take(2).subscribe(loading => {
			if (!loading) {
				refresher.complete();
			}
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

  public getProviders() {
    this._store.dispatch(new TriggerAddProviders());
  }

  public selectProviderTypes() {
    return this._store.select(state => state.meters.providerType);
  }

  public selectProviderCountries() {
    return this._store.select(state => state.meters.provider._country);
  }

  public selectProviderRegions() {
    return this._store.select(state => state.meters.provider._region);
  }

  public selectProviderProviders() {
    return this._store.select(state => state.meters.provider._provider);
  }

  public selectProviderPlans() {
    return this._store.select(state => state.meters.provider._plan);
  }

  public getProviderCountries(provider: IProvider) {
    this._store.dispatch(new TriggerGetProviderCountries(provider));
  }

  public getProviderRegions(path: string) {
    this._store.dispatch(new TriggerGetProviderRegions({path}));
  }

  public getProviderProviders(path: string) {
    this._store.dispatch(new TriggerGetProviders({path}));
  }

  public getProviderPlans(path: string) {
    this._store.dispatch(new TriggerGetProviderPlans({path}));
  }

	public loadNeighborhoodReads(meter: IMeter, dateRange: IDateRange) {
		this._store.dispatch(new LoadingComparisonReads());
		this._store.dispatch(new TriggerComparisonReads({ meter, dateRange }));
	}

	public selectComparisonReads() {
		return this._store.select(state => state.comparison.data);
	}

	public selectComparisonLoading() {
		return this._store.select(state => state.comparison.loading);
	}

}
