import { Component, Input, OnChanges, OnInit } from "@angular/core";

@Component({
  selector: "neighborhood-comparison",
  templateUrl: "neighborhood-comparison.html"
})
export class NeighborhoodComparisonComponent implements OnInit, OnChanges {
  @Input() comparisonReads: any[];

  ngOnChanges() {
    console.log("comparison data => ", this.comparisonReads);
  }

  ngOnInit() {
  }
}
