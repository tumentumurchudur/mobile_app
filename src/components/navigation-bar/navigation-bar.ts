import { Component, EventEmitter, Output, Input } from "@angular/core";
import { navigationConfigs  } from "../../configs";

@Component({
  selector: "navigation-bar",
  templateUrl: "navigation-bar.html"
})
export class NavigationBarComponent {
  private _navigationItems = navigationConfigs;

  @Output() itemTapped = new EventEmitter<string>();

  private _currentSelection: string = this._navigationItems.ARC_CHART;

  private _onClick(item: string) {
    this._currentSelection = item;

    this.itemTapped.emit(item);
  }

}
