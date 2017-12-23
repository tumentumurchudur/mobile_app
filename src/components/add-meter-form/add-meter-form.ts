import { Component, Inject, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AlertController, NavController, LoadingController } from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";
import * as moment from "moment";
import { StoreServices } from "../../store/services";
import { IMeter, IUser } from "../../interfaces/index";
import {Observable} from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: "add-meter-form",
  templateUrl: "add-meter-form.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMeterFormComponent {
  private _addMeter: FormGroup;
  private _user: IUser;
  private _meterGuid: string;
  private _subscriptions: Subscription[] = [];
  private _step: number = 1;
  private _loading: any;
  private _billingStartDate = moment().format("YYYY-MM-DD");
  private _providerTypes$: Observable<any>;
  private _providerCountries$: Observable<any>;
  private _providerRegions$: Observable<any>;
  private _providerProviders$: Observable<any>;
  private _providerPlans$: Observable<any>;
  private _addMeterGuid$: Observable<any>;

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
    this._addMeterGuid$ = this._storeServices.selectAddMeterGuid();
  }

  ngOnInit() {
    this._storeServices.getProviders();
    const subscription = this._storeServices.selectUser()
      .subscribe((user: IUser) => {
        this._user = user;
      });

    this._subscriptions.push(subscription);

    const meterSubscription = this._addMeterGuid$.subscribe((guid) => {
      if (this._loading) {
        this._loading.dismiss({guid});
      }
    })

    this._subscriptions.push(meterSubscription);

  }

  ngOnDestroy() {
    for (const subscription of this._subscriptions) {
      subscription.unsubscribe();
    }
  }

  private _incStep(): void {
    if (this._step === 2){
      this._validateMeter();
      return;
    }

    this._step++;
  }

  private _decStep(): void {
    this._step--;
  }

  private _validateMeter() {
    this._showLoadingController();
    this._loading.onDidDismiss((guidState) => {

      if (!guidState) {
        const timeoutAlert = this.alertCtrl.create({
          message: "Connection is weak. Would you like to keep trying?",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                timeoutAlert.dismiss();
              }
            },
            {
              text: "Continue",
              handler: () => {
                this._showLoadingController();
                timeoutAlert.dismiss();
              }
            }
          ]
        });
        timeoutAlert.present();
      } else if (!guidState.guid) {
        const alert = this.alertCtrl.create({
          message: "Unfortunately, we are not collecting data for this meter yet.",
          buttons: [
            {
              text: "Ok",
              role: "cancel"
            }
          ]
        });
        alert.present();
      } else {
        this._step++;
        this._meterGuid = guidState.guid;
      }
    });
   this._storeServices.validateMeter(this._addMeter.value["meterNumber"]);
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

  private _showLoadingController() {
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
    const user = this._user;

    const utilityType = this._addMeter.value["utilityType"];
    const meterId = this._addMeter.value["meterNumber"];
    const country = this._addMeter.value["country"];
    const region = this._addMeter.value["region"];
    const meterProvider = this._addMeter.value["provider"];
    const provider = `${utilityType}/${country}/${region}/${meterProvider}`;
    const plan = this._addMeter.value["plan"];
    const meterGoal = this._addMeter.value["goal"];
    const goal = meterGoal ? parseFloat(meterGoal) : null;
    const billingStart = parseInt(moment(this._addMeter.value["billingStart"]).format("DD"));
    const name = this._addMeter.value["name"];


    const meter: IMeter = {
      _utilityType: utilityType,
      _meter_id: meterId,
      _provider: provider,
      _plan: plan,
      _goal: goal,
      _billing_start: billingStart,
      _name: name,
      _guid: this._meterGuid
    };

    this._storeServices.addMeter(meter, user);
  }

}
