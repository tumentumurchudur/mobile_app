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

  @Output() timeSpanChanged = new EventEmitter<string>();
  @Output() itemTapped = new EventEmitter<string>();

  private _currentTimespan = timeSpanConfigs.MONTH;

  constructor(private alertCtrl: AlertController) {
  }

  private _onTap(direction: string) {

    this.itemTapped.emit(direction);
  }

  private _changeTimeSpan() {
    const alert = this.alertCtrl.create();
    alert.setCssClass('timespan-alert');

    for(const timespan in timeSpanConfigs) {
      const currentTimeSpan = timeSpanConfigs[timespan];

      alert.addButton({
        text: currentTimeSpan.substring(0, currentTimeSpan.length - 1),
        handler: () => {
          this._currentTimespan = currentTimeSpan.substring(0, currentTimeSpan.length - 1);
          this.timeSpanChanged.emit(currentTimeSpan);
        }
      });
    }
    alert.present();
  }

}
