import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppState } from "../reducers";
import { IUser, IReads, IMeter, IDateRange, IComparison } from "../../interfaces";
import { Observable } from "rxjs/Observable";
import {
	ResetProviders,
	TriggerAddProviders,
  TriggerGetProviderCountries,
  TriggerGetProviderRegions,
  TriggerGetProviders,
  TriggerGetProviderPlans,
	AddUser,
	UpdateUser,
  ResetPassword,
	TriggerAddMeter,
	TriggerRemoveMeter,
	TriggerLoadMeters,
	TriggerUpdateMeterReads,
	TriggerUpdateMeterSettings,
  TriggerValidateMeter,
	TriggerComparisonReads,
	AddReads,
	LoadingReads,
	LoadReadsByMeters,
	LoadReadsByDateRange,
	LoadingComparisonReads,
	ResetComparisonTimeout
} from "../actions";


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

	public updateMeterReads(meter: IMeter, user: IUser) {
		// Update reads for given meter.
		this._store.dispatch(new TriggerUpdateMeterReads({ meter, user }));
	}

	public updateMeterSettings(meter: IMeter, user: IUser) {
		this._store.dispatch(new TriggerUpdateMeterSettings({ meter, user }));
	}

	public selectMeterLoading(): Observable<boolean> {
		return this._store.select(state => state.meters.loading);
	}

  public addMeter(meter: IMeter, user: IUser) {
    this._store.dispatch(new TriggerAddMeter({ meter, user }));
	}

	public removeMeter(meter: IMeter, user: IUser) {
		this._store.dispatch(new TriggerRemoveMeter({ meter, user }));
	}

	public selectMeters(): Observable<IMeter[]> {
		return this._store.select(state => state.meters.data);
	}

  public selectUser(): Observable<IUser> {
    return this._store.select(state => state.user);
  }

	public addUser(user: IUser) {
		this._store.dispatch(new AddUser(user));
	}

	public updateUser(user: IUser) {
		this._store.dispatch(new UpdateUser(user));
	}

	public updateAllMetersReads(meters$: Observable<IMeter[]>, user: IUser) {
		meters$.take(1).subscribe((meters: IMeter[]) => {
			// Set loading to true in the store.
			this._store.dispatch(new TriggerUpdateMeterReads(null));

			// Update reads for every meter.
			this._store.dispatch(new LoadReadsByMeters({ meters, user }));
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

	public loadReadsByDateRange(meter: IMeter, dateRange: IDateRange) {
		this._store.dispatch(new LoadingReads());
		this._store.dispatch(new LoadReadsByDateRange({ meter, dateRange }));
	}

	public selectReadsLoading() {
		return this._store.select(state => state.reads.loading);
	}

	public selectReadsData(): Observable<IReads[]> {
		return this._store.select(state => state.reads.data);
	}

  public getProviders() {
    this._store.dispatch(new TriggerAddProviders());
  }

  public selectProviderTypes() {
    return this._store.select(state => state.providers.providerTypes);
  }

  public selectProviderCountries() {
    return this._store.select(state => state.providers.provider.countries);
  }

  public selectProviderRegions() {
    return this._store.select(state => state.providers.provider.regions);
  }

  public selectProviderServiceProviders() {
    return this._store.select(state => state.providers.provider.serviceProviders);
  }

  public selectProviderPlans() {
    return this._store.select(state => state.providers.provider.plans);
  }

  public selectAddMeterGuid(): Observable<string> {
    return this._store.select(state => state.providers.provider.guid);
  }

  public getProviderCountries(utilityType: string) {
    this._store.dispatch(new TriggerGetProviderCountries(utilityType));
  }

  public getProviderRegions(path: string) {
    this._store.dispatch(new TriggerGetProviderRegions(path));
  }

  public getProviderProviders(path: string) {
    this._store.dispatch(new TriggerGetProviders(path));
  }

  public getProviderPlans(path: string) {
    this._store.dispatch(new TriggerGetProviderPlans(path));
  }

  public resetProviders() {
	  this._store.dispatch(new ResetProviders());
  }

  public validateMeter(meterNumber: string) {
	  this._store.dispatch(new TriggerValidateMeter(meterNumber));
  }

	public loadNeighborhoodReads(meter: IMeter, dateRange: IDateRange) {
		const guid = meter._guid;

		this._store.dispatch(new ResetComparisonTimeout({ guid, dateRange }));
		this._store.dispatch(new LoadingComparisonReads());
		this._store.dispatch(new TriggerComparisonReads({ meter, dateRange }));
	}

	public selectComparisonReads(): Observable<IComparison[]> {
		return this._store.select(state => state.comparison.data);
	}

	public selectComparisonGroup(): Observable<any> {
		return this._store.select(state => state.comparison.neighborhoodGroup);
	}

	public selectComparisonLoading() {
		return this._store.select(state => state.comparison.loading);
	}

	public resetPassword(emailAdd: string) {
    this._store.dispatch(new ResetPassword(emailAdd));
  }

}
