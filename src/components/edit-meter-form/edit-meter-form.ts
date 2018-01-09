import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { AlertController } from "ionic-angular";
import {FormGroup, FormBuilder, FormControl} from "@angular/forms";
import {Keyboard} from '@ionic-native/keyboard';

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
    private _storeServices: StoreServices,
    private _alertCtrl: AlertController,
    private _keyboard: Keyboard
  ) { }

  ngOnInit() {
    this._providerName = this.meter._provider.split("/").pop() || "No provider";
    this._planName = this.meter._plan || "No plan";

    this._editMeter = this._formBuilder.group({
      name: [this.meter._name],
      meterNumber: new FormControl({value: this.meter._meter_id, disabled: true}),
      provider: new FormControl({value: this._providerName + " - " + this._planName, disabled: true}),
      billingStart: [this.meter._billing_start],
      goal: [this.meter._goal]
    });
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

  private _onDeleteClick(): void {
    this._presentConfirm();
  }

  private _presentConfirm(): void {
    this._alertCtrl.create({
      title: "Confirm delete",
      message: "Are you sure that you want to delete this meter?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Delete",
          handler: () => {
            this._storeServices.removeMeter(this.meter, this.user);

            this.cancelClicked.emit();
          }
        }
      ]
    }).present();
  }

  private _keyBoardClose() {
    this._keyboard.close();
  }

}
