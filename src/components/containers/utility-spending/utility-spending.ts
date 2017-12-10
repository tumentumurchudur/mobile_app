import { Component, OnInit, Input, ChangeDetectionStrategy } from "@angular/core";

import { StoreServices } from "../../../store/services";

import { Observable } from "rxjs/Observable";
import { IUser, IMeter, IReads, IDateRange } from "../../../interfaces";
import { chartConfigs, navigationConfigs, timeSpanConfigs } from "../../../configs";
import { ChartHelper } from "../../../helpers";
import { ILineItem } from "../../../interfaces/line-item";

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

  private _navigationItems = navigationConfigs;
  private _currentNavigationItems: string[] = [];
  private _currentMeterIndex: number = 0;
  private _selectedDateRanges: IDateRange[] = [];

  // TODO: Remove when API is implemented.
  private _mockData: any[] = [
    { date: new Date("1/1/2017"), line1: 7, line2: 9, line3: 15 },
    { date: new Date("1/4/2017"), line1: 10, line2: 5, line3: 19 },
    { date: new Date("1/10/2017"), line1: 4, line2: 6, line3: 25 },
    { date: new Date("1/15/2017"), line1: 9, line2: 35, line3: 24 }
  ];
  private _mockSelectedData: any[] = [];
  private _mockSelectedSeries: any[] = [];
  private _mockSelectedColors: any[] = [];
  private _mockLegends: any[] = ["You", "Average", "Efficient"];
  private _mockUsageData: any[] = ["38 kWh", "59 kWh", "43 kW"];

  private _lineColors: string[] = ["orange", "red", "green"];
  private _neighborhoodCosts: any[] = ["15", "25", "10"];
  private _neighborhoodSeries: any[] = ["line1", "line2", "line3"];

  constructor(
    private _storeServices: StoreServices
  ) {
    this._meters$ = this._storeServices.selectMeters();
    this._meterLoading$ = this._storeServices.selectMeterLoading();
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
    this._storeServices.updateMeterReads(meter);
  }

  private _isUsageCostBehindGoal(meter: IMeter) {
    return meter._actualUsageCost > this._getDailyGoalCost(meter);
  }

  private _updateAllMeters(refresher: any, index: number) {
    this._currentMeterIndex = index;
    this._storeServices.updateAllMetersReads(this._meters$);

    // TODO: Needs improvement.
    setTimeout(() => {
      refresher.complete();
    }, 750);
  }

  private _onNavigationItemClick(selectedItem: string, meter: IMeter, index: number) {
    this._currentNavigationItems[index] = selectedItem;
    this._currentMeterIndex = index;

    // Line chart is selected.
    if (this._currentNavigationItems[index] === this._navigationItems.LINE_CHART) {
      const { timeSpan } = this._selectedDateRanges[index];

      // Get default dates if start and end dates are empty.
      if (!this._selectedDateRanges[index].startDate || !this._selectedDateRanges[index].endDate) {
        const { startDate, endDate, dateFormat } = ChartHelper.getDefaultDateRange(timeSpan);

        this._selectedDateRanges[index].startDate = startDate;
        this._selectedDateRanges[index].endDate = endDate;
        this._selectedDateRanges[index].dateFormat = dateFormat;
      }

      // Initiate request to load data from database for given guid, start and end dates.
      this._storeServices.loadReadsByDateRange(
        meter,
        timeSpan,
        this._selectedDateRanges[index].startDate,
        this._selectedDateRanges[index].endDate
      );
    }
  }

  private _onTimeSpanClick(timeSpan: string, meter: IMeter, index: number): void {
    // Sets default start and end dates.
    const { startDate, endDate, dateFormat } = ChartHelper.getDefaultDateRange(timeSpan);

    this._selectedDateRanges[index].timeSpan = timeSpan;
    this._selectedDateRanges[index].startDate = startDate;
    this._selectedDateRanges[index].endDate = endDate;
    this._selectedDateRanges[index].dateFormat = dateFormat;

    this._currentMeterIndex = index;

    this._storeServices.loadReadsByDateRange(meter, timeSpan, startDate, endDate);
  }

  private _shouldDisableNextButton(index: number): boolean {
    return this._selectedDateRanges[index].endDate > new Date();
  }

  private _onTimeTravelClick(direction: string, meter: IMeter, index: number) {
    this._selectedDateRanges[index] = ChartHelper.getDateRange(direction, this._selectedDateRanges[index]);

    const { timeSpan, startDate, endDate } = this._selectedDateRanges[index];

    this._storeServices.loadReadsByDateRange(meter, timeSpan, startDate, endDate);
  }

  private _getDataByGuid(reads: IReads[], guid: string, index: number): any {
    const { startDate, endDate } = this._selectedDateRanges[index];
    const data = reads.filter(read => {
      return read.guid === guid &&
        read.startDate.toString() === startDate.toString() &&
        read.endDate.toString() === endDate.toString()
    })[0] || null;

    if (data) {
      return { deltas: data.deltas, cost: data.cost };
    }
    return { deltas: [], cost: null };
  }

  private _showDateRange(index: number): string {
    return ChartHelper.getFormattedDateRange(this._selectedDateRanges[index]);
  }

  // TODO: Remove
  private _onNeighborhoodCostClick(chartIndex: number, meterIndex: number): void {
    const index = (chartIndex + 1).toString();

    this._mockSelectedData[meterIndex] = this._mockData.map(data => {
      const { date } = data;
      const line = data["line" + index];

      if (chartIndex === 0) {
        return {
          date,
          line1: line
        }
      } else if (chartIndex === 1) {
        return {
          date,
          line2: line
        }
      } else {
        return {
          date,
          line3: line
        }
      }

    });

    this._mockSelectedSeries[meterIndex] = ["line" + index];
    this._mockSelectedColors[meterIndex] = [this._lineColors[chartIndex]];
  }

  private _onShowAll(index: number): void {
    this._mockSelectedData = [];
    this._mockSelectedSeries = [];
    this._mockSelectedColors = [];
  }

}
