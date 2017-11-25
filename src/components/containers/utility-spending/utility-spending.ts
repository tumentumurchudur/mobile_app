import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

import { StoreServices } from "../../../store/services";

import { Observable } from "rxjs/Observable";
import { IUser, IMeter, IReadSummaries } from '../../../interfaces';
import { chartConfigs, navigationConfigs } from "../../../configs";
import { IReads } from '../../../interfaces/reads';

const MAX_NUM_OF_CHARTS: number = 15;

@Component({
  selector: 'utility-spending',
  templateUrl: 'utility-spending.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UtilitySpendingComponent implements OnInit {
  @Input() user: IUser | null;

  private _meters$: Observable<IMeter[] | null>;
  private _summaries$: Observable<IReadSummaries[] | null>;
  private _loading$: Observable<boolean>;
  private _reads$: Observable<IReads[] | null>;

  private _navigationItems = navigationConfigs;
  private _currentNavigationItems: string[] = [];
  private _currentMeterIndex: number = 0;
  private _selectedTimeSpans: string[] = [];

  constructor(
    private _storeServices: StoreServices
  ) {
    this._meters$ = this._storeServices.selectMeters();
    this._summaries$ = this._storeServices.selectSummariesData();
    this._loading$ = this._storeServices.selectSummariesLoading();
    this._reads$ = this._storeServices.selectReadsData();
  }

  ngOnInit() {
    this._storeServices.loadMeters(this.user);

    // Initializes the # of chart that can be shown.
    // TODO: This should be more dynamic based on meters.length.
    for (let i = 0; i < MAX_NUM_OF_CHARTS; i++) {
      this._currentNavigationItems[i] = this._navigationItems.ARC_CHART;
      this._selectedTimeSpans[i] = "months";
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
    this._storeServices.loadReadsFromDb(this._meters$);
  }

  private _onNavigationItemTap(item: any) {
    this._currentNavigationItems[item.index] = item.selection;
    this._currentMeterIndex = item.index;

    if (this._currentNavigationItems[item.index] === this._navigationItems.LINE_CHART) {
      const timeSpan = this._selectedTimeSpans[item.index];

      this._storeServices.loadSummaries(this._meters$, item.index, timeSpan);
    }
  }

  private _onTimeSpanTap(timeSpan) {
    // TODO: Implement time span click.
  }

  private _getSummariesByGuid(summaries: IReadSummaries[], guid: string, index: number) {
    const data = summaries.filter(summary => {
      return summary.guid === guid && summary.timeSpan === this._selectedTimeSpans[index]
    })[0];

    return data ? data.summaries : [];
  }

  // TODO: Needs to determine.
  private _getDateFormat(index: number): string {
    switch(this._selectedTimeSpans[index]) {
      case "hours":
        return "%b%y";
      default:
        return "%b";
    }
  }

  // TODO: Replace by handler for time span component.
  private _onTimeSpanClick(guid: string, timeSpan: string, index: number): void {
    this._selectedTimeSpans[index] = timeSpan;
    this._currentMeterIndex = index;

    this._storeServices.loadSummaries(this._meters$, index, timeSpan);
  }

  private _onPrevMonth(meterGuid: string) {
    const startDate = new Date("11/1/2017");
    const endDate = new Date("11/30/2017");

    this._storeServices.loadReadsByDateRange(meterGuid, startDate, endDate);
  }

  private _getReadsByGuid(reads: IReads[], guid: string, index: number) {
    const data = reads.filter(read => {
      return read.guid === guid
    })[0];

    return data ? data.reads : [];
  }
}
