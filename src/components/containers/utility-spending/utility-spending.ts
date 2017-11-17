import { Component, OnInit, Input } from '@angular/core';

import { StoreServices } from "../../../store/services";

import { Observable } from "rxjs/Observable";
import { IUser, IMeter, ILineItem } from '../../../interfaces';
import { chartConfigs, navigationConfigs } from "../../../configs";

const MAX_NUM_OF_CHARTS: number = 15;

@Component({
  selector: 'utility-spending',
  templateUrl: 'utility-spending.html'
})
export class UtilitySpendingComponent implements OnInit {
  @Input() user: IUser | null;

  private _meters: Observable<IMeter[] | null>;
  private _navigationItems = navigationConfigs;
  private _currentNavigationItems: string[] = [];
  private _currentNavigationIndex: number = 0;

  // TODO: Remove once wired it up to meter reads.
  private _lineChartData: ILineItem[] = [
    { date: new Date("11/1/2017"),  line1: 30.13, line2: 25.15, line3: 15 },
    { date: new Date("11/5/2017"),  line1: 15.98, line2: 35.15, line3: 25 },
    { date: new Date("11/15/2017"), line1: 61.25, line2: 15.15, line3: 35 },
    { date: new Date("11/21/2017"), line1: 10.25, line2: 45.15, line3: 125 },
    { date: new Date("11/24/2017"), line1: 24.25, line2: 45.15, line3: 125 },
    { date: new Date("11/27/2017"), line1: 66.25, line2: 25.15, line3: 25 },
    { date: new Date("11/28/2017"), line1: 10.25, line2: 45.15, line3: 125 },
    { date: new Date("11/29/2017"), line1: 24.25, line2: 45.15, line3: 125 },
    { date: new Date("11/30/2017"), line1: 66.25, line2: 25.15, line3: 25 }
  ];

  constructor(
    private _storeServices: StoreServices
  ) {
    this._meters = this._storeServices.selectMeters();
  }

  ngOnInit() {
    this._storeServices.loadMeters(this.user);

    // Initializes the # of chart that can be shown.
    // TODO: This should be more dynamic based on meters.length.
    for (let i = 0; i < MAX_NUM_OF_CHARTS; i++) {
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
    this._currentNavigationIndex = item.index;
  }

}
