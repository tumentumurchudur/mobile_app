import { Injectable } from '@angular/core';
import { IUser } from '../interfaces';
import { Observable } from "rxjs/Observable";
import { fireBaseConfig, databasePaths } from '../configs';
import firebase from 'firebase';

@Injectable()
export class DatabaseProvider {
  private _db: firebase.database.Database;
  private _usersRef: firebase.database.Reference;

  constructor() {
    if (!firebase.apps.length) {
        firebase.initializeApp(fireBaseConfig);
    }

    this._db = firebase.database();

    this._usersRef = this._db.ref(databasePaths.usersPath);
  }

  public getOrgPath(uid: string): Promise<string> {
    return this._usersRef.child(uid).once('value').then(snapshot => {
      let orgObj;
      const { orgs = null} = snapshot.val();

      if (orgs && !Array.isArray(orgs)) {
        orgObj = orgs;
      }
      orgObj = orgs[0];

      return Promise.resolve(orgObj.path.toString());
    }).catch(err => {
      return Promise.reject(err.message);
    });
  }
}
