import { Injectable } from '@angular/core';
import { Store } from "@ngrx/store";
import { AppState } from "../reducers";
import { LoadMeters } from "../actions";

@Injectable()
export class StoreServices {

	constructor(
		private _store: Store<AppState>
	) { }

  public loadMeters(uid: string) {
		this._store.dispatch(new LoadMeters((uid)));
	}

}
