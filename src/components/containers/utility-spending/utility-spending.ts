import { Component, OnInit, Input } from '@angular/core';

import { Store } from '@ngrx/store';
import { AppState } from '../../../store/reducers';
import { StoreServices } from "../../../store/services";
import { Storage } from "@ionic/storage";

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
    private _storeServices: StoreServices,
    private readonly _storage: Storage
  ) {
    this._meters = this._store.select(state => state.meters);
  }

  ngOnInit() {
    this._storeServices.loadMeters(this.user.uid);
  }

  private _getColors(meter: IMeter): string[] {
    const meterConfig = chartConfigs.filter(config => config.name === meter._utilityType)[0] || null;

    return meterConfig ? meterConfig.color : [];
  }

  private _getUnit(meter: IMeter): string {
    const meterConfig = chartConfigs.filter(config => config.name === meter._utilityType)[0] || null;

    return meterConfig ? meterConfig.unit : "";
  }

  private _getImage(meter: IMeter) {
    const meterConfig = chartConfigs.filter(config => config.name === meter._utilityType)[0] || null;

    return meterConfig ? meterConfig.imgSrc : "";
  }

  private _getDailyGoalCost(meter: IMeter) {
    return meter._goal / meter._billing_total * meter._billing_since_start;
  }

  private _isUsageCostBehindGoal(meter: IMeter) {
    return meter._actualUsageCost > this._getDailyGoalCost(meter);
  }

  private reloadClick() {
    this._storeServices.loadMeters(this.user.uid);
  }

}
