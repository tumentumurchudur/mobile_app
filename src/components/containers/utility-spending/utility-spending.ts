import { Component, OnInit, Input } from '@angular/core';

import { Store } from '@ngrx/store';
import { AppState } from '../../../store/reducers';
import { StoreServices } from "../../../store/services";

import { Observable } from "rxjs/Observable";
import { IUser, IMeter } from '../../../interfaces';

@Component({
  selector: 'utility-spending',
  templateUrl: 'utility-spending.html'
})
export class UtilitySpendingComponent implements OnInit {
  @Input() user: IUser | null;

  private _meters: Observable<IMeter[] | null>;

  constructor(
    private _store: Store<AppState>,
    private _storeServices: StoreServices
  ) {
    this._meters = this._store.select(state => state.meters);
  }

  ngOnInit() {
    this._storeServices.loadMeters(this.user.uid);
  }

}
