import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { ChartHelper  } from "../../helpers";
import { IRead } from "../../interfaces/read";

@Component({
  selector: "neighborhood-comparison",
  templateUrl: "neighborhood-comparison.html"
})
export class NeighborhoodComparisonComponent implements OnInit, OnChanges {
  @Input() comparisonReads: any[];
  @Input() timeSpan: string;

  private _data: any[];

  ngOnChanges() {
    console.log("comparison data => ", this.comparisonReads);

    if (this.comparisonReads && this.comparisonReads.length) {
      this._data = this.comparisonReads[0].avg;
    }
  }

  ngOnInit() {
  }
}
