import { Component, Input, OnChanges, ChangeDetectionStrategy } from "@angular/core";

import { ChartHelper  } from "../../helpers";
import { IRead, IDateRange, IComparison } from "../../interfaces";

@Component({
  selector: "neighborhood-comparison",
  templateUrl: "neighborhood-comparison.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NeighborhoodComparisonComponent implements OnChanges {
  @Input() comparisonReads: IComparison[];
  @Input() loading: boolean;
  @Input() dateRange: IDateRange;
  @Input() guid: string;

  private _data: any[];
  private _series: string[] = [];
  private _lineColors: string[] = [];
  private _legends: string[] = [];

  private _options = [
    { line: "line1", color: "orange", legend: "You" },
    { line: "line2", color: "red", legend: "Average" },
    { line: "line3", color: "green", legend: "Efficient" }
  ];

  private _selectedData: any[];
  private _selectedSeries: any[];
  private _selectedColor: string[];

  // TODO: Calculate these.
  private _mockUsageData: any[] = ["38 kWh", "59 kWh", "43 kW"];
  private _neighborhoodCosts: any[] = ["15", "25", "10"];

  public ngOnChanges() {
    if (this.comparisonReads && this.comparisonReads.length) {
      // Reset selected lines in the chart.
      this._onShowAll();

      const { startDate, endDate } = this.dateRange;

      const filteredReads = this.comparisonReads.filter(read => {
        return read.guid === this.guid &&
          read.startDate.toString() === startDate.toString() &&
          read.endDate.toString() === endDate.toString();
      });

      this._data = filteredReads.length ? filteredReads[0].calcReads : [];

      if (this._data && this._data.length) {
        const lines = Object.keys(this._data[0]).filter(d => d.indexOf("line") !== -1);

        const availOptions = this._options.map(option => {
          return lines.indexOf(option.line) !== -1 ? option : null;
        }).filter(line => line !== null);

        this._series = availOptions.map(option => option.line);
        this._lineColors = availOptions.map(option => option.color);
        this._legends = availOptions.map(option => option.legend);
      }
    }
  }

  private _filterChartData(chartIndex: number): void {
    const lineIndex = chartIndex + 1;

    this._selectedData = this._data.map(d => {
      const lineData = d["line" + lineIndex];

      if (chartIndex === 0) {
        return {
          date: d.date,
          line1: lineData
        }
      } else if (chartIndex === 1) {
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

    this._selectedSeries = this._series.filter(s => s === "line" + lineIndex);
    this._selectedColor = [this._lineColors[chartIndex]];
  }

  private _onShowAll(): void {
    this._selectedData = null;
    this._selectedSeries = null;
    this._selectedColor = null;
  }

}
