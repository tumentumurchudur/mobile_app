import { Component, Input } from "@angular/core";

@Component({
  selector: "app-spinner",
  templateUrl: "app-spinner.html"
})
export class AppSpinnerComponent {
  @Input() text: string = "Loading...";
}
