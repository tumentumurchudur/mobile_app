import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { AlertController, ModalController } from "ionic-angular";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { Keyboard } from "@ionic-native/keyboard";

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
  private _currentMeterName: string;
  private _providerPath: string;
  private _newProviderPath: string;

  constructor(
    private _formBuilder: FormBuilder,
    private _storeServices: StoreServices,
    private _alertCtrl: AlertController,
    private _modalCtrl: ModalController,
    private _keyboard: Keyboard
  ) { }

  ngOnInit() {
    this._providerName = this.meter._provider.split("/").pop() || "No provider";
    this._planName = this.meter._plan || "No plan";
    this._currentMeterName = this.meter._name;
    this._providerPath = this.meter._provider;
    this._editMeter = this._formBuilder.group({
      name: [this.meter._name],
      meterNumber: new FormControl({value: this.meter._meter_id, disabled: true}),
      provider: [this._providerName + " - " + this._planName],
      plan: [this._planName],
      billingStart: [this.meter._billing_start],
      goal: [this.meter._goal]
    });
  }

  protected _editProvider() {
    this._storeServices.resetProviders();
    const modal = this._modalCtrl.create("EditProviderPage", {
      providerData: this.meter._provider,
      plan: this._planName
    });
    modal.onDidDismiss((data) => {
      if (!data) {
        return;
      }
        this._providerName = data.provider.value["provider"];
        this._planName = data.provider.value["plan"];
        this._providerPath = `${data.type}/${data.provider.value["country"]}/${data.provider.value["region"]}/${data.provider.value["provider"]}`;

        if (this._editMeter.value["provider"] !== this._newProviderPath || this._editMeter.value["plan"] !== this._planName) {
          this._editMeter.patchValue({provider: this._providerName + " - " + this._planName, plan: this._planName});
          this._editMeter.markAsDirty();
        }
    });
    modal.present();
  }

  private _save(): void {
    const newMeter: IMeter = Object.assign({}, this.meter, {
      _billing_start: parseInt(this._editMeter.value["billingStart"]),
      _goal: parseInt(this._editMeter.value["goal"]),
      _name: this._editMeter.value["name"],
      _provider: this._providerPath,
      _oldMeterName: this._currentMeterName
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
