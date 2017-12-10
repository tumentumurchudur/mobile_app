import { Component, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "edit-meter-form",
  templateUrl: "edit-meter-form.html"
})
export class EditMeterFormComponent {
  @Output() cancelClicked = new EventEmitter();

  private _editMeter: FormGroup;

  constructor(
    private _formBuilder: FormBuilder
  ) {
    this._editMeter = this._formBuilder.group({
      name: ["John"],
      meterNumber: [123456],
      provider: ["provider"],
      plan: ["plan"],
      billingStart: [15],
      goal: [100],
      billingCycle: ["1 month"]
    });
  }

  private _keyboardSubmit(): void {

  }

  private _editProvider(): void {

  }

  private _save(): void {

  }

  private _onCancel(): void {
    this.cancelClicked.emit();
  }

  private _onDelete(): void {

  }

}
