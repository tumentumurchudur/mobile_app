import { Component, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AlertController, NavController, LoadingController } from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";
import * as moment from "moment";

@Component({
  selector: "add-meter-form",
  templateUrl: "add-meter-form.html"
})
export class AddMeterFormComponent {

  private _addMeter: FormGroup;
  private _step: number = 1;
  private _loading: any;
  private _validateMeterStatus: string;
  private _dateBS: string = moment().format("YYYY-MM-DD");


  constructor(
    // @Inject(FormBuilder)formBuilder: FormBuilder,
    private _formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private keyboard: Keyboard
  ) {

    this._addMeter = _formBuilder.group({
      utilityType: ["", Validators.required],
      meterNumber: ["", Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(10), Validators.pattern("[a-zA-Z0-9]*")])],
      billingStart: this._dateBS,
      country: [""],
      region: [""],
      provider: [""],
      plan: ["", Validators.required],
      goal: [null, [Validators.min(0)]],
      name: ["", Validators.required]
    });
  }

  private _nextStep(): void {
    // if (this._step === 2) {
    //   this._validateMeter();
    //   return;
    // }
    this._step++;
  }

  private _previousStep(): void {
    this._step--;
  }

 _validateMeter() {
    this.showLoading();

    this._loading.onDidDismiss(() => {
      // No meter data came back, this timed out, so show the alert.
      if (this._validateMeterStatus === "") {

        let timeoutAlert = this.alertCtrl.create({
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
                this.showLoading();
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

  showLoading() {
    this._loading = this.loadingCtrl.create({
      content: "Verifying Meter",
      duration: 10000
    });
    this._loading.present();
  }

  keyboardSubmit() {
    this.keyboard.close();
  }

}
