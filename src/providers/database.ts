import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { HttpClient } from "@angular/common/http";

import { fireBaseConfig, databasePaths, databaseToken } from '../configs';
import { IUser, IMeter } from '../interfaces';

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/combineLatest";
import { IReads } from '../interfaces/reads';
import * as _ from 'lodash';


@Injectable()
export class DatabaseProvider {
  private _db: firebase.database.Database;
  private _usersRef: firebase.database.Reference;
  private _orgsRef: firebase.database.Reference;
  private _readsRef: firebase.database.Reference;
  private _providersRef: firebase.database.Reference;

  constructor(private _http: HttpClient) {
    if (!firebase.apps.length) {
        firebase.initializeApp(fireBaseConfig);
    }

    this._db = firebase.database();

    this._usersRef = this._db.ref(databasePaths.users);
    this._orgsRef = this._db.ref(databasePaths.orgs);
    this._readsRef = this._db.ref(databasePaths.reads);
    this._providersRef = this._db.ref(databasePaths.providers);
  }

  /**
   * Gets org path string from uid.
   *
   * @param {string} uid
   * @returns {Observable<string>}
   * @memberof DatabaseProvider
   */
  public getOrgPathForUser(uid: string): Observable<string> {
    return Observable.create(observer => {
      return this._usersRef.child(uid).once("value").then(snapshot => {
        const { orgs = null } = snapshot.val();

        if (orgs && !Array.isArray(orgs)) {
          observer.next(orgs.path);
        } else {
          observer.next(orgs[0].path);
        }
      }, error => {
        observer.error(error);
      });
    });
  }

  /**
   * Gets all meters associated with the given org path and
   * returns the meters as an array.
   *
   * @param {string} orgPath
   * @returns {Observable<IMeter[]>}
   * @memberof DatabaseProvider
   */
  public getMetersForOrg(orgPath: string): Observable<IMeter[]> {
    return Observable.create(observer => {
      return this._orgsRef.child(orgPath).once("value").then(snapshot => {
        let meters: IMeter[] = [];

        snapshot.forEach(child => {
          const building = child.val();
          const metersInBuilding = building._meters;

          if (building && metersInBuilding) {
            const { _gas = null, _power = null, _solar = null, _water = null } = metersInBuilding;

            const gasMeters = _gas ? this._getMeters(_gas, "gas") : [];
            const powerMeters = _power ? this._getMeters(_power, "power") : [];
            const solarMeters = _solar ? this._getMeters(_solar, "solar") : [];
            const waterMeters = _water ? this._getMeters(_water, "water") : [];

            // Flattens meters arrays into a single array.
            meters = [].concat(gasMeters, powerMeters, solarMeters, waterMeters);
          }
        });

        observer.next(meters);
      }, error => {
        observer.error(error);
      });
    });
  }

  /**
   * Gets reads data for each meter in the meters array and
   * adds _reads property that have the reads data.
   *
   * Example: meters: [{ _name, _billingStart, ... }, {...}]
   * returns meters: [{ _name, _billingStart, _reads: [...] }, {..., _reads: [...]}]
   *
   * @param {IMeter[]} meters
   * @returns {Observable<IMeter[]>}
   * @memberof DatabaseProvider
   */
  public getReadsForMeters(meters: IMeter[]): Observable<IMeter[]> {
    return Observable
      .combineLatest(
        // sends request for reads for each meter using meter guid.
        ...meters.map(meter => this.getReadsForMeter(meter._guid, meter._billing_start))
      )
      .map((allMeterData: IMeter[][]) => {
        // Adds property _reads and assigns the reads for each meter in the passed meters array.
        return meters.map((meter, index) => {
          return { ...meter, _reads: allMeterData[index] }
        });
      });
  }

  /**
   * Gets provider data for each meter in the meters array.
   * Adds data for _summer, _facilityFee and _winter as properties.
   *
   * @param {IMeter[]} meters
   * @returns {Observable<IMeter[]>}
   * @memberof DatabaseProvider
   */
  public getProviderForMeters(meters: IMeter[]): Observable<IMeter[]> {
    return Observable
      .combineLatest(
        ...meters.map(meter => this._getProviderForMeter(meter._provider))
      )
      .map(providers => {
        const planTypes = ["Residential", "City", "County"];

        return providers.map((provider, index) => {
          const { plans = null } = provider;
          let rateInfo = null;

          for(const type of planTypes) {
            if (plans[type]) {
              rateInfo = plans[type];
              break;
            }
          }

          const facilityFee = rateInfo ? rateInfo.facility_fee : null;
          const rateSchedules = rateInfo ? rateInfo.rate_schedules : null;
          const summer = rateSchedules ? rateSchedules.summer : null;
          const winter = rateSchedules ? rateSchedules.winter : null;

          return {
            ...meters[index],
            _summer: summer, _winter: winter, _facilityFee: facilityFee
          }
        });
      });
  }

  /**
   * Gets provider data for the given provider path.
   *
   * @private
   * @param {string} providerPath
   * @returns {Observable<any>}
   * @memberof DatabaseProvider
   */
  private _getProviderForMeter(providerPath: string): Observable<any> {
    return Observable.create(observer => {
      return this._providersRef.child(providerPath).once("value").then(snapshot => {
        const providerData = snapshot.val();

        observer.next(providerData);
        }, error => {
          observer.error(error);
        });
    });
  }

  /**
   * Gets all reads for the given meter using meter guid and billing start date.
   *
   * @private
   * @param {string} meterGuid
   * @param {number} billingStart
   * @returns {Observable<IMeter[]>}
   * @memberof DatabaseProvider
   */
  public getReadsForMeter(meterGuid: string, billingStart: number): Observable<IMeter[]> {
    const today = new Date();
    const refDate = new Date(today.getFullYear(), today.getMonth(), billingStart);
    const prevBillingStartDate = new Date(today.getFullYear(), today.getMonth() - 1, billingStart);
    const billingStartDate = refDate < today ? refDate : prevBillingStartDate;

    const startAt = billingStartDate.getTime().toString();
    const endAt = today.getTime().toString();

    return Observable.create(observer => {
      return this._readsRef
        .child(meterGuid)
        .child("reads")
        .orderByKey()
        .startAt(startAt)
        .endAt(endAt)
        .once("value")
        .then(snapshot => {
          const data = snapshot.val();
          let reads = [];

          if (data) {
            reads = Object.keys(data).map(key => {
              return { date: key, total: data[key].total };
            });
          }

          observer.next(reads);
        }, error => {
          observer.error(error);
        });
    });
  }

  public getSummaries(meterGuid: string, timeSpan: string) {
    return Observable.create(observer => {
      return this._readsRef
      .child(meterGuid)
      .child(`read_summaries/${timeSpan}`)
      .orderByKey()
      .once("value")
      .then(snapshot => {
        const data = snapshot.val();
        let reads = [];

        if (data) {
          reads = Object.keys(data).map(key => {
            return {
              date: new Date(data[key].lastReadTime),
              line1: data[key].delta
            };
          });
        }
        observer.next(reads);
      }, error => {
        observer.error(error);
      });
    });
  }

  public getReadsByDateRange(meterGuid: string, startDate: Date, endDate: Date): Observable<IReads[]> {
    const startAt = startDate.getTime().toString();
    const endAt = endDate.getTime().toString();

    return Observable.create(observer => {
      return this._readsRef
        .child(meterGuid)
        .child("reads")
        .orderByKey()
        .startAt(startAt)
        .endAt(endAt)
        .once("value")
        .then(snapshot => {
          const data = snapshot.val();
          let reads = [];

          if (data) {
            reads = Object.keys(data).map(key => {
              return { date: key, total: data[key].total };
            });
          }

          observer.next(reads);
        }, error => {
          observer.error(error);
        });
    });
  }

  public updateMeterSettings(meter: IMeter, user: IUser): Observable<IMeter> {
    return Observable.create(observer => {
      const updates = {};
      const path = `${user.orgPath}/Building1/_meters/_${meter._utilityType}/${meter._name}`;
      const settings = {
        _billing_start: meter._billing_start,
        _goal: meter._goal,
        _guid: meter._guid,
        _meter_id: meter._meter_id,
        _provider: meter._provider,
        _plan: meter._plan,
        _type: meter._type
      };

      updates[path] = settings;

      this._orgsRef.update(updates).then(() => {
        observer.next(Object.assign({}, meter, settings));
      }, error => {
        observer.error(error);
      });
    });
  }

  public getShallowList(httpService: any, path: string) {
    return httpService.get(`${path}.json?auth=${databaseToken.production}&shallow=true`)
      .map(res => _.keys(res));
  }

  public getProviderTypes(): Observable<any> {
    return Observable.create(observer => {
      const data = this.getShallowList(this._http, `${this._providersRef}`);
      observer.next(data || []);
    })
  }

  /**
   * Iterates over meterObject containing meters and
   * puts the meters into an array and returns the array.
   *
   * Example: { MeterY: IMeter, MeterZ: IMeter, ... }
   *
   * @private
   * @param {*} meterObject
   * @param {string} meterType
   * @returns {IMeter[]}
   * @memberof DatabaseProvider
   */
  private _getMeters(meterObject: any, meterType: string): IMeter[] {
    return Object.keys(meterObject).map(key => {
      return Object.assign({}, meterObject[key], { _name: key, _utilityType: meterType });
    });
  }

}
