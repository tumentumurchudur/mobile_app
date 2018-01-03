import { Component, Input } from "@angular/core";

@Component({
  selector: "app-spinner",
  templateUrl: "app-spinner.html"
})
export class AppSpinnerComponent {
  @Input() text: string = "Loading...";

  private _getSvg() {
    return `url("../assets/imgs/vutiliti_logo.svg") no-repeat 50% 50%`;
  }
}
