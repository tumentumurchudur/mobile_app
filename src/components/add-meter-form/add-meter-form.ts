import {Component, Inject} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {AlertController, NavController, LoadingController} from 'ionic-angular';
import {Keyboard} from '@ionic-native/keyboard';
import moment, {Moment} from 'moment';

@Component({
  selector: 'add-meter-form',
  templateUrl: 'add-meter-form.html'
})
export class AddMeterFormComponent {

  private addMeter: FormGroup;
  private _step: number = 1;
  loading: any;
  validateMeterStatus: string;
  timeoutAlert: any;
  private dateBS: string = moment().format("YYYY-MM-DD");


  constructor(@Inject(FormBuilder)formBuilder: FormBuilder,
              public alertCtrl: AlertController,
              public navCtrl: NavController,
              public loadingCtrl: LoadingController,
              private keyboard: Keyboard
  ) {

    this.addMeter = formBuilder.group({
      utilityType: ["", Validators.required],
      meterNumber: ["", Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(10), Validators.pattern("[a-zA-Z0-9]*")])],
      billingStart: this.dateBS,
      country: [""],
      region: [""],
      provider: [""],
      plan: ["", Validators.required],
      goal: [null, [Validators.min(0)]],
      name: ["", Validators.required]
    });
  }

  nextStep(): void {
    // if (this._step == 2) {
    //   this.validateMeter();
    //   return;
    // }
    this._step++;
  }

  previousStep(): void {
    this._step--;
  }


  validateMeter() {
    this.showLoading();

    this.loading.onDidDismiss(() => {

      // No meter data came back, this timed out, so show the alert.
      if (this.validateMeterStatus == "") {

        let timeoutAlert = this.alertCtrl.create({
          message: "Connection is weak. Would you like to keep trying?",
          buttons: [
            {
              text: "Cancel",
              role: 'cancel',
              handler: () => {
                this.validateMeterStatus = "cancel";
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
    this.loading = this.loadingCtrl.create({
      content: 'Verifying Meter',
      duration: 10000
    });
    this.loading.present();
  }

  keyboardSubmit() {
    this.keyboard.close();
  }

}
