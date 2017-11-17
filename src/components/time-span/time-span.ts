import { Component, EventEmitter, Output, Input } from '@angular/core';
import {AlertController, DateTime} from 'ionic-angular';

@Component({
  selector: 'time-span',
  templateUrl: 'time-span.html'
})
export class TimeSpanComponent {

  constructor(private alertCtrl: AlertController) {

  }


  private _today = Date.now();
  // TODO: Move these to configs.
  private _timespanSelections: Array<string> = [
    "hour",
    "day",
    "week",
    "month",
    "year"
  ];

  @Input() index: number = 0;
  @Output() itemTapped = new EventEmitter<any>();

  private _currentTimespan: string = this._timespanSelections[1];

  private _onTap(item: string) {
    this._currentTimespan = item;

    this.itemTapped.emit({ selection: this._currentTimespan, index: this.index });
  }

  changeTimeSpan() {
    let alert = this.alertCtrl.create();

    alert.setCssClass('timespan-alert');

    this._timespanSelections.forEach((timespan) => {
      alert.addButton({
        text: timespan,
        handler: () => {
          this._currentTimespan = timespan;
        }
      });
    });

    // 'null' means 'now'
    alert.present();
  }

  adjacentDateRangePeriod() {

  }

}
