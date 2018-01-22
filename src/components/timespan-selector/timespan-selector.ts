import { Component, EventEmitter, Output, Input } from "@angular/core";
import { AlertController } from "ionic-angular";
import { timeSpanConfigs } from "../../configs";

@Component({
  selector: "timespan-selector",
  templateUrl: "timespan-selector.html"
})
export class TimeSpanSelectorComponent {
  @Input() selectedTimeSpan: string = timeSpanConfigs.MONTH;
  @Input() disableNextButton: boolean = false;
  @Input() disablePrevButton: boolean = false;

  @Output() timeSpanChanged = new EventEmitter<string>();
  @Output() itemTapped = new EventEmitter<string>();

  constructor(
    private alertCtrl: AlertController) {
  }

  private _onTap(direction: string) {
    this.itemTapped.emit(direction);
  }

  private _changeTimeSpan() {
    const alert = this.alertCtrl.create();
    alert.setCssClass("timespan-alert");

    for (const timeSpan in timeSpanConfigs) {
      const currentTimeSpan = timeSpanConfigs[timeSpan];

      alert.addButton({
        text: currentTimeSpan.substring(0, currentTimeSpan.length - 1),
        handler: () => {
          this.timeSpanChanged.emit(currentTimeSpan);
        }
      });
    }
    alert.present();
  }

  private _getSelectedTimeSpan() {
    return this.selectedTimeSpan.substring(0, this.selectedTimeSpan.length - 1);
  }

}
