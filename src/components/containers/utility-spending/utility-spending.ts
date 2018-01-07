import { Component, OnInit, Input, ChangeDetectionStrategy } from "@angular/core";

import { StoreServices } from "../../../store/services";

import { Observable } from "rxjs/Observable";
import { IUser, IMeter, IReads, IDateRange, ILineItem, IComparison } from "../../../interfaces";
import { chartConfigs, navigationConfigs, timeSpanConfigs } from "../../../configs";
import { ChartHelper } from "../../../helpers";

import { trigger, state, style, animate, transition } from "@angular/animations";

const MAX_NUM_OF_CHARTS: number = 15;

@Component({
  selector: "utility-spending",
  templateUrl: "utility-spending.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("cardState", [
      transition(":enter", [
        style({ transform: "rotateY(90deg)" }),
        animate("500ms 100ms ease-in-out")
      ])
    ])
  ]
})
export class UtilitySpendingComponent implements OnInit {
  @Input() user: IUser | null;

  private _meters$: Observable<IMeter[] | null>;
  private _meterLoading$: Observable<boolean>;
  private _reads$: Observable<IReads[] | null>;
  private _loadingReads$: Observable<boolean>;
  private _comparison$: Observable<IComparison[]>;
  private _comparisonLoading$: Observable<boolean>;

  private _navigationItems = navigationConfigs;
  private _currentNavigationItems: string[] = [];
  private _currentMeterIndex: number = 0;
  private _selectedDateRanges: IDateRange[] = [];

  constructor(
    private _storeServices: StoreServices
  ) {
    this._meters$ = this._storeServices.selectMeters();
    this._meterLoading$ = this._storeServices.selectMeterLoading();
    this._reads$ = this._storeServices.selectReadsData();
    this._loadingReads$ = this._storeServices.selectReadsLoading();
    this._comparison$ = this._storeServices.selectComparisonReads();
    this._comparisonLoading$ = this._storeServices.selectComparisonLoading();
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

  private _getMeterConfig(meter: IMeter, config: string) {
    const meterConfig = chartConfigs.filter(config => config.name === meter._utilityType)[0] || null;

    return meterConfig ? meterConfig[config] : "";
  }

  private _getDailyGoalCost(meter: IMeter) {
    const goalDailyCost = meter._goal / meter._billing_total;
    const facilityFeePerDay = meter._facilityFee / meter._billing_total;

    return goalDailyCost * meter._billing_since_start + facilityFeePerDay;
  }

  private _updateMeter(meter: IMeter, index: number) {
    this._currentMeterIndex = index;
    this._storeServices.updateMeterReads(meter, this.user);
  }

  private _isUsageCostBehindGoal(meter: IMeter) {
    return meter._actualUsageCost > this._getDailyGoalCost(meter);
  }

  private _updateAllMeters(refresher: any, index: number) {
    this._currentMeterIndex = index;

    this._storeServices.updateAllMetersReads(this._meters$, this.user);
    this._storeServices.updateLoaderWhenReadsDone(refresher);
  }

  private _setDefaultDateRange(index: number) {
    const { timeSpan } = this._selectedDateRanges[index];
    const { startDate, endDate, dateFormat } = ChartHelper.getDefaultDateRange(timeSpan);

    this._selectedDateRanges[index].startDate = startDate;
    this._selectedDateRanges[index].endDate = endDate;
    this._selectedDateRanges[index].dateFormat = dateFormat;
  }

  private _onNavigationItemClick(selectedItem: string, meter: IMeter, index: number) {
    this._currentNavigationItems[index] = selectedItem;
    this._currentMeterIndex = index;

    // Line chart is selected.
    if (this._currentNavigationItems[index] === this._navigationItems.LINE_CHART) {
      const { timeSpan, startDate, endDate } = this._selectedDateRanges[index];

      // Set default dates if start and end dates are empty.
      if (!startDate || !endDate) {
        this._setDefaultDateRange(index);
      }

      // Initiate request to load data from database for given guid, start and end dates.
      this._storeServices.loadReadsByDateRange(
        meter,
        timeSpan,
        this._selectedDateRanges[index].startDate,
        this._selectedDateRanges[index].endDate
      );
    } else if (this._currentNavigationItems[index] === this._navigationItems.COMPARISON) {
      const { timeSpan, startDate, endDate } = this._selectedDateRanges[index];

      // Set default dates if start and end dates are empty.
      if (!startDate || !endDate) {
        this._setDefaultDateRange(index);
      }

      // Trigger a request to load neighborhood reads from API.
      this._storeServices.loadNeighborhoodReads(
        meter,
        {
          timeSpan,
          startDate: this._selectedDateRanges[index].startDate,
          endDate: this._selectedDateRanges[index].endDate
        }
      );
    }
  }

  private _onTimeSpanClick(timeSpan: string, meter: IMeter, index: number, page: string): void {
    // Sets default start and end dates.
    const { startDate, endDate, dateFormat } = ChartHelper.getDefaultDateRange(timeSpan);

    this._selectedDateRanges[index].timeSpan = timeSpan;
    this._selectedDateRanges[index].startDate = startDate;
    this._selectedDateRanges[index].endDate = endDate;
    this._selectedDateRanges[index].dateFormat = dateFormat;

    this._currentMeterIndex = index;

    if (page === "timeTravel") {
      this._storeServices.loadReadsByDateRange(meter, timeSpan, startDate, endDate);
    } else {
      this._storeServices.loadNeighborhoodReads(
        meter,
        {
          timeSpan,
          startDate: this._selectedDateRanges[index].startDate,
          endDate: this._selectedDateRanges[index].endDate
        }
      );
    }
  }

  private _shouldDisableNextButton(index: number): boolean {
    return this._selectedDateRanges[index].endDate > new Date();
  }

  private _onTimeTravelClick(direction: string, meter: IMeter, index: number, page: string): void {
    this._selectedDateRanges[index] = ChartHelper.getDateRange(direction, this._selectedDateRanges[index]);

    const { timeSpan, startDate, endDate } = this._selectedDateRanges[index];

    if (page === "timeTravel") {
      this._storeServices.loadReadsByDateRange(meter, timeSpan, startDate, endDate);
    } else {
      this._storeServices.loadNeighborhoodReads(
        meter,
        {
          timeSpan,
          startDate: this._selectedDateRanges[index].startDate,
          endDate: this._selectedDateRanges[index].endDate
        }
      );
    }
  }

  private _getDataByGuid(reads: IReads[], guid: string, index: number): any {
    const { startDate, endDate } = this._selectedDateRanges[index];
    const data = reads.find(read => {
      return read.guid === guid &&
        read.startDate.toString() === startDate.toString() &&
        read.endDate.toString() === endDate.toString()
    });

    if (data) {
      return { deltas: data.deltas, cost: data.cost };
    }
    return { deltas: [], cost: null };
  }

  private _getNeighborhoodRank(comparisonReads: IComparison[], meter: IMeter, index: number) {
    const { startDate, endDate } = this._selectedDateRanges[index];
    const data = comparisonReads.find(read => {
      return read.guid === meter._guid &&
        read.startDate.toString() === startDate.toString() &&
        read.endDate.toString() === endDate.toString()
    });

    return data ? data.rank : null;
  }

  private _showDateRange(index: number): string {
    return ChartHelper.getFormattedDateRange(this._selectedDateRanges[index]);
  }

  private _onCancelEditMeter(meter: IMeter, index: number): void {
    this._currentNavigationItems[index] = this._navigationItems.ARC_CHART;
  }

  private _onSaveEditMeter(meter: IMeter, index: number): void {
    this._storeServices.updateMeterSettings(meter, this.user);

    this._meterLoading$.take(2).subscribe(loading => {
      if (!loading) {
        this._currentNavigationItems[index] = this._navigationItems.ARC_CHART;
      }
    });
  }

}
