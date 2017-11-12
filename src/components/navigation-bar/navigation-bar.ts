import { Component, EventEmitter, Output, Input } from '@angular/core';

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

  @Input() index: number = 0;
  @Output() itemTapped = new EventEmitter<any>();

  private _currentSelection: string = this._selections.ARC_CHART;

  constructor() {
  }

  private _onTap(item: string) {
    this._currentSelection = item;
    const index = this.index;
    this.itemTapped.emit({ selection: this._currentSelection, index });
  }

}
