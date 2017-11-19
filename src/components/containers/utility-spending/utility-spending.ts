import { Component, OnInit, Input } from '@angular/core';

import { StoreServices } from "../../../store/services";

import { Observable } from "rxjs/Observable";
import { IUser, IMeter, IReadSummaries } from '../../../interfaces';
import { chartConfigs, navigationConfigs } from "../../../configs";

const MAX_NUM_OF_CHARTS: number = 15;

@Component({
  selector: 'utility-spending',
  templateUrl: 'utility-spending.html'
})
export class UtilitySpendingComponent implements OnInit {
  @Input() user: IUser | null;

  private _meters: Observable<IMeter[] | null>;
  private _summaries: Observable<any[] | null>;

  private _navigationItems = navigationConfigs;
  private _currentNavigationItems: string[] = [];
  private _currentNavigationIndex: number = 0;

  constructor(
    private _storeServices: StoreServices
  ) {
    this._meters = this._storeServices.selectMeters();
    this._summaries = this._storeServices.selectSummaryReads();
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
    this._storeServices.loadReadsFromDb(this._meters);
  }

  private _onNavigationItemTap(item: any) {
    this._currentNavigationItems[item.index] = item.selection;
    this._currentNavigationIndex = item.index;

    if (this._currentNavigationItems[item.index] === this._navigationItems.LINE_CHART) {
      this._storeServices.loadSummariesFromDb(this._meters, this._currentNavigationIndex);
    }
  }

  private _getSummariesByGuid(summaries: IReadSummaries[], guid: string) {
    const data = summaries.filter(summary => summary.guid === guid)[0];

    return data ? data.summaries : [];
  }

  private _hasLineChartData(summaries: IReadSummaries[], guid: string) {
    const data = summaries.filter(summary => summary.guid === guid)[0];

    return data ? data.summaries.length > 0 : false;
  }
}
