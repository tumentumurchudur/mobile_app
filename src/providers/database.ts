import { Injectable } from '@angular/core';
import firebase from 'firebase';

import { fireBaseConfig, databasePaths } from '../configs';
import { IUser, IMeter } from '../interfaces';

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/combineLatest";

@Injectable()
export class DatabaseProvider {
  private _db: firebase.database.Database;
  private _usersRef: firebase.database.Reference;
  private _orgsRef: firebase.database.Reference;
  private _readsRef: firebase.database.Reference;
  private _providersRef: firebase.database.Reference;

  constructor() {
    if (!firebase.apps.length) {
        firebase.initializeApp(fireBaseConfig);
    }

    this._db = firebase.database();

    this._usersRef = this._db.ref(databasePaths.users);
    this._orgsRef = this._db.ref(databasePaths.orgs);
    this._readsRef = this._db.ref(databasePaths.reads);
    this._providersRef = this._db.ref(databasePaths.providers);
  }

  public getOrgPathForUser(uid: string): Observable<string> {
    return Observable.create(observer => {
      return this._usersRef.child(uid).once('value').then(snapshot => {
        let orgObj;
        const { orgs = null} = snapshot.val();

        if (orgs && !Array.isArray(orgs)) {
          orgObj = orgs;
        } else {
          orgObj = orgs[0];
        }

        observer.next(orgObj.path || null);
        }, error => {
          observer.error(error);
        });
    });
  }

  public getMetersForOrg(orgPath: string): Observable<IMeter[]> {
    let meters: IMeter[] = [];

    return Observable.create(observer => {
      return this._orgsRef.child(orgPath).once("value").then(snapshot => {
        snapshot.forEach(childSnapshot => {
          const building = childSnapshot.val();
          const buildingMeters = building._meters;

          if (building && buildingMeters) {
            const { _gas = null, _power = null, _solar = null, _water = null } = buildingMeters;

            const gasMeters = _gas ? this._getMeterProps(_gas, "gas") : [];
            const powerMeters = _power ? this._getMeterProps(_power, "power") : [];
            const solarMeters = _solar ? this._getMeterProps(_solar, "solar") : [];
            const waterMeters = _water ? this._getMeterProps(_water, "water") : [];

            meters = [].concat(gasMeters, powerMeters, solarMeters, waterMeters);
          }
        });

        observer.next(meters);
      }, error => {
        observer.error(error);
      });
    });
  }

  public getReadsForMeters(meters: IMeter[]): Observable<IMeter[]> {
    return Observable
      .combineLatest(
        ...meters.map(meter => this._getReadsForMeter(meter._guid))
      )
      .map(values => {
        return meters.map((meter, index) => {
          return { ...meter, _reads: values[index] }
        });
      });
  }

  public getProviderForMeters(meters: IMeter[]): Observable<any[]> {
    return Observable
      .combineLatest(
        ...meters.map(meter => this._getProviderForMeter(meter._provider))
      )
      .map(values => {
        return values.map((value, index) => {
          const { plans = null } = value;
          const residential = plans ? plans.Residential : null;
          const facilityFee = residential ? residential.facility_fee : null;
          const rateSchedules = residential ? residential.rate_schedules : null;
          const summer = rateSchedules ? rateSchedules.summer : null;
          const winter = rateSchedules ? rateSchedules.winter : null;

          return {
            ...meters[index],
            _summer: summer, _winter: winter, _facilityFee: facilityFee
          }
        });
      });
  }

  private _getProviderForMeter(providerPath: string): Observable<any> {
    return Observable.create(observer => {
      return this._providersRef.child(providerPath).once("value").then(snapshot => {
        const data = snapshot.val();

        observer.next(data);
        }, error => {
          observer.error(error);
        });
    });
  }

  private _getReadsForMeter(meterGuid: string): Observable<any[]> {
    return Observable.create(observer => {
      return this._readsRef.child(meterGuid).child("reads").once("value").then(snapshot => {
        const data = snapshot.val();
        const reads = Object.keys(data).map(key => {
          return { date: key, total: data[key].total };
        });

        observer.next(reads);
        }, error => {
          observer.error(error);
        });
    });
  }

  private _getMeterProps(meter: any, type: string): IMeter[] {
    const props = [];

    for (let key of Object.keys(meter)) {
      props.push(Object.assign({}, meter[key], { _name: key, _utilityType: type }));
    }
    return props;
  }

}
