import { Component, OnInit, Input } from '@angular/core';

import { Store } from '@ngrx/store';
import { AppState } from '../../../store/reducers';
import { StoreServices } from "../../../store/services";

import { Observable } from "rxjs/Observable";
import { IUser, IMeter } from '../../../interfaces';
import { chartConfigs } from "../../../configs";

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

  private _getColors(meter: IMeter): string[] {
    return chartConfigs.filter(config => config.name === meter._utilityType)[0].color;
  }

  private _getUnit(meter: IMeter): string {
    return chartConfigs.filter(config => config.name === meter._utilityType)[0].unit;
  }

  private _getDailyGoalCost(meter: IMeter) {
    return meter._goal / meter._billing_total * meter._billing_since_start;
  }

}
