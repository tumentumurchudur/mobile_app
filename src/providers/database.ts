import { Injectable } from '@angular/core';
import { IUser, IMeter } from '../interfaces';
import { Observable } from "rxjs/Observable";
import { fireBaseConfig, databasePaths } from '../configs';
import firebase from 'firebase';

@Injectable()
export class DatabaseProvider {
  private _db: firebase.database.Database;
  private _usersRef: firebase.database.Reference;
  private _orgsRef: firebase.database.Reference;
  private _readsRef: firebase.database.Reference;

  constructor() {
    if (!firebase.apps.length) {
        firebase.initializeApp(fireBaseConfig);
    }

    this._db = firebase.database();

    this._usersRef = this._db.ref(databasePaths.usersPath);
    this._orgsRef = this._db.ref(databasePaths.orgsPath);
    this._readsRef = this._db.ref(databasePaths.readsPath);
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

            const gasMeters = _gas ? this._getMeter(_gas) : [];
            const powerMeters = _power ? this._getMeter(_power) : [];
            const solarMeters = _solar ? this._getMeter(_solar) : [];
            const waterMeters = _water ? this._getMeter(_water) : [];

            meters = [].concat(gasMeters, powerMeters, solarMeters, waterMeters);
          }
        });

        observer.next(meters);
      }, error => {
        observer.error(error);
      });
    });
  }

  public getReadsForMeter(meterGuid: string): Observable<any[]> {
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

  private _getMeter(meter): IMeter[] {
    const meters = [];

    for (let key of Object.keys(meter)) {
      meters.push(Object.assign({}, meter[key], { _name: key }));
    }
    return meters;
  }
}
