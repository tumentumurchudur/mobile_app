import { Component, OnInit, Input, ChangeDetectionStrategy } from "@angular/core";

import { StoreServices } from "../../../store/services";

import { Observable } from "rxjs/Observable";
import { IUser, IMeter, IReadSummaries, IReads, IRead, IDateRange } from "../../../interfaces";
import { chartConfigs, navigationConfigs, timeSpanConfigs } from "../../../configs";
import { ChartHelper } from "../../../helpers";

const MAX_NUM_OF_CHARTS: number = 15;

@Component({
  selector: 'utility-spending',
  templateUrl: 'utility-spending.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UtilitySpendingComponent implements OnInit {
  @Input() user: IUser | null;

  private _meters$: Observable<IMeter[] | null>;
  private _reads$: Observable<IReads[] | null>;
  private _loadingReads$: Observable<boolean>;

  private _navigationItems = navigationConfigs;
  private _currentNavigationItems: string[] = [];
  private _currentMeterIndex: number = 0;
  private _selectedDateRanges: IDateRange[] = [];

  constructor(
    private _storeServices: StoreServices
  ) {
    this._meters$ = this._storeServices.selectMeters();
    this._reads$ = this._storeServices.selectReadsData();
    this._loadingReads$ = this._storeServices.selectReadsLoading();
  }

  ngOnInit() {
    this._storeServices.loadMeters(this.user);

    // Initializes the # of chart that can be shown.
    // TODO: This should be more dynamic based on meters.length.
    for (let i = 0; i < MAX_NUM_OF_CHARTS; i++) {
      this._currentNavigationItems[i] = this._navigationItems.ARC_CHART;
      this._selectedDateRanges[i] = { timeSpan: timeSpanConfigs.MONTH };
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

  private _onNavigationItemClick(selectedItem: string, index: number, meterGuid: string) {
    this._currentNavigationItems[index] = selectedItem;
    this._currentMeterIndex = index;

    // Line chart is selected.
    if (this._currentNavigationItems[index] === this._navigationItems.LINE_CHART) {
      const { timeSpan } = this._selectedDateRanges[index];
      const { startDate, endDate, dateFormat } = ChartHelper.getDefaultDateRange(timeSpan);

      this._selectedDateRanges[index].startDate = startDate;
      this._selectedDateRanges[index].endDate = endDate;
      this._selectedDateRanges[index].dateFormat = dateFormat;

      // Initiate request to load data from database for given guid, start and end dates.
      this._storeServices.loadReadsByDateRange(meterGuid, startDate, endDate);
    }
  }

  // TODO: Replace by handler for time span component.
  private _onTimeSpanClick(meterGuid: string, timeSpan, index: number): void {
    // Sets default start and end dates.
    const { startDate, endDate, dateFormat } = ChartHelper.getDefaultDateRange(timeSpan.timeSpan);

    this._selectedDateRanges[index].timeSpan = timeSpan.timeSpan;
    this._selectedDateRanges[index].startDate = startDate;
    this._selectedDateRanges[index].endDate = endDate;
    this._selectedDateRanges[index].dateFormat = dateFormat;

    this._currentMeterIndex = index;

    this._storeServices.loadReadsByDateRange(meterGuid, startDate, endDate);
  }

  private _onTimeTravelClick(direction, meterGuid: string, index: number) {
    this._selectedDateRanges[index] = ChartHelper.getDateRange(direction.direction, this._selectedDateRanges[index]);

    const { startDate, endDate } = this._selectedDateRanges[index];

    this._storeServices.loadReadsByDateRange(meterGuid, startDate, endDate);
  }

  private _getReadsByGuid(reads: IReads[], guid: string, index: number): any[] {
    const { startDate, endDate } = this._selectedDateRanges[index];
    const data = reads.filter(read => {
      return read.guid === guid && read.startDate === startDate && read.endDate === endDate
    })[0] || null;

    return data ? data.deltas : [];
  }
}
