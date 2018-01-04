import { Component, Input, OnChanges, ChangeDetectionStrategy } from "@angular/core";

import { ChartHelper } from "../../helpers";
import { IDateRange, IComparison, IMeter, IUsage } from "../../interfaces";
import { chartConfigs } from "../../configs";

@Component({
  selector: "neighborhood-comparison",
  templateUrl: "neighborhood-comparison.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NeighborhoodComparisonComponent implements OnChanges {
  @Input() comparisonReads: IComparison[];
  @Input() loading: boolean;
  @Input() dateRange: IDateRange;
  @Input() meter: IMeter;

  private _allData: any[] = [];
  private _series: string[] = [];
  private _lineColors: string[] = [];
  private _legends: string[] = [];

  private _options = [
    { line: "line1", color: "#2075CB", legend: "You" },
    { line: "line2", color: "#EF8E0F", legend: "Average" },
    { line: "line3", color: "#00B200", legend: "Efficient" }
  ];

  private _selectedData: any[];
  private _selectedSeries: any[];
  private _selectedColor: string[];

  private _costs: number[] = [];
  private _consumptions: number[] = [];

  public ngOnChanges() {
    if (!this.comparisonReads || !this.comparisonReads.length) {
      this._allData = [];
      return;
    }

    this._onShowAll();

    const { startDate, endDate } = this.dateRange;

    const filteredReads = this.comparisonReads.filter(read => {
      return read.guid === this.meter._guid &&
        read.startDate.toString() === startDate.toString() &&
        read.endDate.toString() === endDate.toString();
    });

    if (!filteredReads.length) {
      return;
    }

    const { calcReads, avgCosts, effCosts, usageCosts } = filteredReads[0];
    this._allData = calcReads || [];

    if (usageCosts) {
      this._costs.push(usageCosts.totalCost);
      this._consumptions.push(usageCosts.totalDelta);
    }

    if (avgCosts) {
      this._costs.push(avgCosts.totalCost);
      this._consumptions.push(avgCosts.totalDelta);
    }

    if (effCosts) {
      this._costs.push(effCosts.totalCost);
      this._consumptions.push(effCosts.totalDelta);
    }

    if (calcReads && calcReads.length) {
      // Find available lines such as line1, line2, etc for chart
      const lines = Object.keys(calcReads[0]).filter(d => d.indexOf("line") !== -1);

      const availOptions = this._options.map(option => {
        return lines.indexOf(option.line) !== -1 ? option : null;
      }).filter(line => line !== null);

      this._series = availOptions.map(option => option.line);
      this._lineColors = availOptions.map(option => option.color);
      this._legends = availOptions.map(option => option.legend);
    }
  }

  private _filterChartData(chartIndex: number, series: string): void {
    this._selectedData = this._allData.map(d => {
      const lineData = d[series];

      if (series === "line1") {
        return {
          date: d.date,
          line1: lineData
        }
      } else if (series === "line2") {
        return {
          date: d.date,
          line2: lineData
        }
      } else {
        return {
          date: d.date,
          line3: lineData
        }
      }
    });

    this._selectedSeries = this._series.filter(s => s === series);
    this._selectedColor = [this._lineColors[chartIndex]];
  }

  private _getUnit(): string {
    const meterConfig = chartConfigs.filter(config => config.name === this.meter._utilityType)[0] || null;

    return meterConfig ? meterConfig["unit"] : "";
  }

  private _onShowAll(): void {
    this._selectedData = null;
    this._selectedSeries = null;
    this._selectedColor = null;
  }

}
