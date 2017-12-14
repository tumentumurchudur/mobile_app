import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

import { IMeter, IUser } from "../../interfaces";
import { StoreServices } from "../../store/services";

@Component({
  selector: "edit-meter-form",
  templateUrl: "edit-meter-form.html"
})
export class EditMeterFormComponent implements OnInit {
  @Input() meter: IMeter | null;
  @Input() user: IUser | null;

  @Output() cancelClicked = new EventEmitter();
  @Output() saveClicked = new EventEmitter<IMeter>();

  private _editMeter: FormGroup;
  private _providerName: string;
  private _planName: string;

  constructor(
    private _formBuilder: FormBuilder,
    private _storeServices: StoreServices
  ) { }

  ngOnInit() {
    this._providerName = this.meter._provider.split('/').pop() || "No provider";
    this._planName = this.meter._plan || "No plan";

    this._editMeter = this._formBuilder.group({
      name: [this.meter._name],
      meterNumber: [this.meter._meter_id],
      provider: [this._providerName + " - " + this._planName],
      billingStart: [this.meter._billing_start],
      goal: [this.meter._goal]
    });
  }

  // TODO: Implement
  private _keyboardSubmit(): void {

  }

  // TODO: Implement
  private _editProvider(): void {

  }

  private _save(): void {
    const newMeter: IMeter = Object.assign({}, this.meter, {
      _billing_start: parseInt(this._editMeter.value["billingStart"]),
      _goal: parseInt(this._editMeter.value["goal"])
    });

    this.saveClicked.emit(newMeter);
  }

  private _onCancel(): void {
    this.cancelClicked.emit();
  }

  // TODO: Implement
  private _onDelete(): void {

  }

}
