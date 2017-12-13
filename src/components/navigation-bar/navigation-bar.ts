import { Component, EventEmitter, Output, Input } from "@angular/core";
import { navigationConfigs  } from "../../configs";

@Component({
  selector: "navigation-bar",
  templateUrl: "navigation-bar.html"
})
export class NavigationBarComponent {
  private _navigationItems = navigationConfigs;

  @Input() selectedItem: string = navigationConfigs.ARC_CHART;
  @Output() itemTapped = new EventEmitter<string>();

  private _onClick(item: string): void {
    this.itemTapped.emit(item);
  }

}
