import { Component, EventEmitter, Output, Input } from "@angular/core";

@Component({
  selector: "retry-button",
  templateUrl: "retry-button.html"
})
export class RetryButtonComponent {
  @Input() text: string;

  @Output() clicked = new EventEmitter();

  private _onClick() {
    this.clicked.emit();
  }
}
