import { Component, Input, OnChanges, ChangeDetectionStrategy } from "@angular/core";
import { ChartHelper  } from "../../helpers";
import { IRead, IDateRange, IComparison } from "../../interfaces";

@Component({
  selector: "neighborhood-comparison",
  templateUrl: "neighborhood-comparison.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NeighborhoodComparisonComponent implements OnChanges {
  @Input() comparisonReads: any[];
  @Input() loading: boolean;
  @Input() dateRange: IDateRange;
  @Input() guid: string;
  @Input() legends: string[];
  @Input() lineColors: string[];
  @Input() dotColors: string[];

  private _data: any[];
  private _series: string[] = ["line1", "line2", "line3"];

  private _selectedData: any[];
  private _selectedSeries: any[];
  private _selectedColor: string[];
  private _selectedDotColor: string[];

  // TODO: Calculate these.
  private _mockUsageData: any[] = ["38 kWh", "59 kWh", "43 kW"];
  private _neighborhoodCosts: any[] = ["15", "25", "10"];

  ngOnChanges() {
    if (this.comparisonReads && this.comparisonReads.length) {
      const { startDate, endDate } = this.dateRange;

      const filteredReads = this.comparisonReads.filter((read: IComparison) => {
        return read.guid === this.guid && read.startDate.toString() === startDate.toString() &&
          read.endDate.toString() === endDate.toString();
      });

      this._data = filteredReads.length ? filteredReads[0].reads : [];
    }
  }

  private _clickCostLabel(chartIndex: number): void {
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
    this._selectedColor = [this.lineColors[chartIndex]];
    this._selectedDotColor = [this.dotColors[chartIndex]];
  }

  private _onShowAll(): void {
    this._selectedData = null;
    this._selectedSeries = null;
    this._selectedColor = null;
    this._selectedDotColor = null;
  }

}
