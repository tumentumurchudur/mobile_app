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

  constructor() {
    if (!firebase.apps.length) {
        firebase.initializeApp(fireBaseConfig);
    }

    this._db = firebase.database();

    this._usersRef = this._db.ref(databasePaths.usersPath);
    this._orgsRef = this._db.ref(databasePaths.orgsPath);
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

  public getMetersForOrg(orgPath: string): Observable<IMeter> {
    return Observable.create(observer => {
      return this._orgsRef.child(orgPath).once('value').then(snapshot => {
        const { Building1 = null } = snapshot.val();

        observer.next(Building1 ? Building1._meters : null);
      }, error => {
        observer.error(error);
      });
    });
  }
}
