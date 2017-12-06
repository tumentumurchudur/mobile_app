import { Component, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AlertController, NavController, LoadingController } from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";
import * as moment from "moment";
import { StoreServices } from "../../store/services";
import { IMeter } from "../../interfaces/meter";
import { ITier } from "../../interfaces/tier";


@Component({
  selector: "add-meter-form",
  templateUrl: "add-meter-form.html"
})
export class AddMeterFormComponent {

  private _addMeter: FormGroup;
  private _step: number = 1;
  private _loading: any;
  private _validateMeterStatus: string;
  private _billingStartDate: string = moment().format("YYYY-MM-DD");


  constructor(
    private _storeServices: StoreServices,
    private _formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private _navCtrl: NavController,
    private _loadingCtrl: LoadingController,
    private _keyboard: Keyboard
  ) {

    this._addMeter = _formBuilder.group({
      utilityType: ["", Validators.required],
      meterNumber: ["", Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(10), Validators.pattern("[a-zA-Z0-9]*")])],
      billingStart: this._billingStartDate,
      country: [""],
      region: [""],
      provider: [""],
      plan: ["", Validators.required],
      goal: [null, [Validators.min(0)]],
      name: ["", Validators.required]
    });
  }

  private _incStep(): void {
    this._step++;
  }

  private _decStep(): void {
    this._step--;
  }

  private _validateMeter() {
    this._showLoading();

    this._loading.onDidDismiss(() => {
      // No meter data came back, this timed out, so show the alert.
      if (!this._validateMeterStatus) {

        const timeoutAlert = this.alertCtrl.create({
          message: "Connection is weak. Would you like to keep trying?",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                this._validateMeterStatus = "cancel";
                timeoutAlert.dismiss();
              }
            },
            {
              text: "Continue",
              handler: () => {
                this._showLoading();
                timeoutAlert.dismiss();
              }
            }
          ]
        });
        timeoutAlert.present();
      }
    });
    //validate meter function would go here
  }

  private _showLoading() {
    this._loading = this._loadingCtrl.create({
      content: "Verifying Meter",
      duration: 10000
    });
    this._loading.present();
  }

  private _keyboardSubmit() {
    this._keyboard.close();
  }

  private _saveMeter() {
    const meter: IMeter = {
      _name: this._addMeter["name"],
      _utilityType: "power",
      _meter_id: this._addMeter["meterNumber"],
      _type: "Just another Type",
      _provider: "provider",
      _plan: "plan",
      _ncmpAvgGuid: "",
      _ncmpEffGuid: "",
      _reads: [],
      _usage: 47,
      _tiers: 'tiers',
      _utilityUnit: "what is this?",
      _goal: (this._addMeter["goal"] != 0) ? parseFloat(this._addMeter.value["goal"]) : null,
      _guid: "{this-is-a-guid}",
      _billing_start: this._addMeter["billingStart"],
      _billing_total: 85,
      _billing_since_start: 45,
      _summer: {
        start_date: new Date(),
        end_date: new Date(),
        tiers: 'any'
      },
      _winter: {
        start_date: new Date(),
        end_date: new Date(),
        tiers: 'any'
      },
      _actualUsageCost: 55,
      _facilityFee: 6,

    };
    this._storeServices.addMeter(meter);
  }

}
