import { Component, EventEmitter, Output, Input } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { timeSpanConfigs } from "../../configs";

@Component({
  selector: 'time-span',
  templateUrl: 'time-span.html'
})
export class TimeSpanComponent {

  @Input() index: number = 0;
  @Input() disableNextButton: boolean = false;
  @Input() disablePrevButton: boolean = false;

  @Output() itemTapped = new EventEmitter<any>();

  private _currentTimespan = timeSpanConfigs.DAY;

  constructor(private alertCtrl: AlertController) {
  }

  private _onTap(action: string) {

    this.itemTapped.emit({direction: action, timeSpan: this._currentTimespan})
  }

  private _changeTimeSpan() {
    const alert = this.alertCtrl.create();

    alert.setCssClass('timespan-alert');

    for(const timespan in timeSpanConfigs) {
      alert.addButton({
        text: timeSpanConfigs[timespan],
        handler: () => {
          this._currentTimespan = timeSpanConfigs[timespan];
        }
      });
    };
    alert.present();
  }

}
