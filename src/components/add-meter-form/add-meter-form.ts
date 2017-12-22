import { Component, Inject, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AlertController, NavController, LoadingController } from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";
import * as moment from "moment";
import { StoreServices } from "../../store/services";
import { IMeter } from "../../interfaces/meter";
import {Observable} from "rxjs/Observable";


@Component({
  selector: "add-meter-form",
  templateUrl: "add-meter-form.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMeterFormComponent {
  private _addMeter: FormGroup;
  private _step: number = 1;
  private _loading: any;
  private _validateMeterStatus: string;
  private _billingStartDate: string = moment().format("YYYY-MM-DD");
  private _providerTypes$: Observable<any>;
  private _providerCountries$: Observable<any>;
  private _providerRegions$: Observable<any>;
  private _providerProviders$: Observable<any>;
  private _providerPlans$: Observable<any>;

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

    this._providerTypes$ = this._storeServices.selectProviderTypes();
    this._providerCountries$ = this._storeServices.selectProviderCountries();
    this._providerRegions$ = this._storeServices.selectProviderRegions();
    this._providerProviders$ = this._storeServices.selectProviderProviders();
    this._providerPlans$ = this._storeServices.selectProviderPlans();
  }

  ngOnInit() {
    this._storeServices.getProviders();
  }

  private _incStep(): void {
    this._step++;
  }

  private _decStep(): void {
    if (this._step === 2){
      this._storeServices.resetProvider();
      this._addMeter.reset();
    }

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

  private _getCountries() {
    this._storeServices.getProviderCountries(this._addMeter.value["utilityType"]);
  }

  private _getRegions() {
    this._storeServices.getProviderRegions(`${this._addMeter.value["utilityType"]}/${this._addMeter.value["country"]}`);
  }

  private _getProviders() {
    this._storeServices.getProviderProviders(`${this._addMeter.value["utilityType"]}/${this._addMeter.value["country"]}/${this._addMeter.value["region"]}`);
  }

  private _getPlans() {
    this._storeServices.getProviderPlans(`${this._addMeter.value["utilityType"]}/${this._addMeter.value["country"]}/${this._addMeter.value["region"]}/${this._addMeter.value["provider"]}/plans`);
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
      const utilityType = this._addMeter.value["utilityType"];
      const meterId = this._addMeter.value["meterNumber"];
      const country = this._addMeter.value["country"];
      const region = this._addMeter.value["region"];
      const meterProvider = this._addMeter.value["provider"].name;
      const provider = `${utilityType}/${country}/${region}/${meterProvider}`;
      const plan = this._addMeter.value["plan"].name;
      const meterGoal = this._addMeter.value["goal"];
      const goal = meterGoal ? parseFloat(meterGoal) : null;
      const billingStart = this._addMeter.value["billingStart"];
      const name = this._addMeter.value["name"];

    const meter: IMeter = {
      _utilityType: utilityType,
      _meter_id: meterId,
      _provider: provider,
      _plan: plan,
      _goal: goal,
      _billing_start: billingStart,
      _name: name
    };

    this._storeServices.addMeter(meter);
  }

}
