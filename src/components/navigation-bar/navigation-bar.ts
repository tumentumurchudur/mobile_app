import { Component, EventEmitter, Output, Input } from "@angular/core";
import { navigationConfigs  } from "../../configs";

@Component({
  selector: 'navigation-bar',
  templateUrl: 'navigation-bar.html'
})
export class NavigationBarComponent {
  private _navigationItems = navigationConfigs;

  @Input() index: number = 0;
  @Output() itemTapped = new EventEmitter<any>();

  private _currentSelection: string = this._navigationItems.ARC_CHART;

  private _onTap(item: string) {
    this._currentSelection = item;

    this.itemTapped.emit({ selection: this._currentSelection, index: this.index });
  }

}
