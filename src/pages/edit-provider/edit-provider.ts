import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormGroup, FormBuilder } from '@angular/forms';
import {Observable} from "rxjs/Observable";
import { StoreServices } from "../../store/services";



@IonicPage()
@Component({
  selector: 'page-edit-provider',
  templateUrl: 'edit-provider.html',
})
export class EditProviderPage {

  private _editProvider: FormGroup;
  private _providerData: string;
  private _providerCountries$: Observable<any>;
  private _providerRegions$: Observable<any>;
  private _providerServiceProviders$: Observable<any>;
  private _providerPlans$: Observable<any>;
  private _addMeterGuid$: Observable<any>;
  private _planName: string;
  private _type: string;
  private _country: string;
  private _region: string;

  constructor(
    private _formBuilder: FormBuilder,
    private _storeServices: StoreServices,
    private navCtrl: NavController,
    private navParams: NavParams) {

    this._providerData = this.navParams.get('providerData').split('/');
    this._planName = this.navParams.get('plan');
    this._type = this._providerData[0];
    this._country = this._providerData[1];
    this._region = this._providerData[2];


    this._editProvider = _formBuilder.group({
      country: [this._country],
      region: [this._region],
      provider: [''],
      plan: ['']
    });

    this._providerCountries$ = this._storeServices.selectProviderCountries();
    this._providerRegions$ = this._storeServices.selectProviderRegions();
    this._providerServiceProviders$ = this._storeServices.selectProviderServiceProviders();
    this._providerPlans$ = this._storeServices.selectProviderPlans();
    this._addMeterGuid$ = this._storeServices.selectAddMeterGuid();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditProviderPage');
    console.log('this._providerData', this._providerData);
    console.log('this._providerData[0]', this._type);
    console.log('this._providerData[1]', this._country);
    console.log('this._providerData[2]', this._region);
    this._storeServices.getProviderCountries(this._type);
    this._storeServices.getProviderRegions(`${this._type}/${this._country}`);
    this._storeServices.getProviderProviders(`${this._type}/${this._country}/${this._region}`);
  }



  private _getRegions() {
    this._storeServices.getProviderRegions(`${this._type}/${this._editProvider.value["country"]}`);
  }

  private _getProviders() {
    this._storeServices.getProviderProviders(`${this._type}/${this._editProvider.value["country"]}/${this._editProvider.value["region"]}`);
  }

  private _getPlans() {
    const provider = this._editProvider.value["provider"].trim();
    console.log(this._editProvider.value["provider"].trim());
    console.log(`${this._type}/${this._editProvider.value["country"]}/${this._editProvider.value["region"]}/${provider}/plans`);
    this._storeServices.getProviderPlans(`${this._type}/${this._editProvider.value["country"]}/${this._editProvider.value["region"]}/${provider}/plans`);
  }

}
