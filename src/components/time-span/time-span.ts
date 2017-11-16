import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'time-span',
  templateUrl: 'time-span.html'
})
export class TimeSpanComponent {
  // TODO: Move these to configs.
  private _selections = {
    HOUR : "hour",
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
    YEAR: "year",
  };

  @Input() index: number = 0;
  @Output() itemTapped = new EventEmitter<any>();

  private _currentSelection: string = this._selections.DAY;

  private _onTap(item: string) {
    this._currentSelection = item;

    this.itemTapped.emit({ selection: this._currentSelection, index: this.index });
  }

}
