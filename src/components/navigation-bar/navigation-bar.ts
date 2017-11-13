import { Component } from '@angular/core';

@Component({
  selector: 'navigation-bar',
  templateUrl: 'navigation-bar.html'
})
export class NavigationBarComponent {
  private _selections = {
    ARC_CHART: "arc-chart",
    LINE_CHART: "line-chart",
    COMPARISON: "comparison",
    EDIT: "edit"
  };

  private _currentSelection: string = this._selections.ARC_CHART;

  constructor() {
  }

  private _onArcChartTap() {
    this._currentSelection = this._selections.ARC_CHART;
    // TODO: Remove when implemented.
    console.log("_onArcChartTap");
  }

  private _onLineChartTap() {
    this._currentSelection = this._selections.LINE_CHART;
    // TODO: Remove when implemented.
    console.log("_onLineChartTap");
  }

  private _onComparisonTap() {
    this._currentSelection = this._selections.COMPARISON;
    // TODO: Remove when implemented.
    console.log("_onComparisonTap");
  }

  private _onEditTap() {
    this._currentSelection = this._selections.EDIT;
    // TODO: Remove when implemented.
    console.log("_onEditTap");
  }

}
