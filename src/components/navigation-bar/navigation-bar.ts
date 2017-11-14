import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'navigation-bar',
  templateUrl: 'navigation-bar.html'
})
export class NavigationBarComponent {
  // TODO: Move these to configs.
  private _selections = {
    ARC_CHART: "arc-chart",
    LINE_CHART: "line-chart",
    COMPARISON: "comparison",
    EDIT: "edit"
  };

  @Input() index: number = 0;
  @Output() itemTapped = new EventEmitter<any>();

  private _currentSelection: string = this._selections.ARC_CHART;

  private _onTap(item: string) {
    this._currentSelection = item;

    this.itemTapped.emit({ selection: this._currentSelection, index: this.index });
  }

}
