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
  private _navigationItems = {
    ARC_CHART: "arc-chart",
    LINE_CHART: "line-chart",
    COMPARISON: "comparison",
    EDIT: "edit"
  };
  private _currentNavigationItems: any[] = [];

  constructor(
    private _store: Store<AppState>,
    private _storeServices: StoreServices
  ) {
    this._meters = this._store.select(state => state.meters);
  }

  ngOnInit() {
    this._storeServices.loadMeters(this.user);
    for (let i = 0; i < 10; i++) {
      this._currentNavigationItems[i] = this._navigationItems.ARC_CHART;
    }
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
    const goalDailyCost = meter._goal / meter._billing_total;
    const facilityFeePerDay = meter._facilityFee / meter._billing_total;

    return goalDailyCost * meter._billing_since_start + facilityFeePerDay;
  }

  private _isUsageCostBehindGoal(meter: IMeter) {
    return meter._actualUsageCost > this._getDailyGoalCost(meter);
  }

  private reloadClick() {
    this._storeServices.loadMetersFromDb(this.user);
  }

  private _onNavigationItemTap(item: any) {
    this._currentNavigationItems[item.index] = item.selection;
    console.log("item tapped", item);
  }

}
