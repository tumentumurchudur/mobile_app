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

    public getOrgPath(uid: string) {
        const guid = '4f2jsiyTLTauwoxcX78tPC7ObEE3';

        this._usersRef.child(guid).on('value', (snapshot) => {
					const { orgs = null} = snapshot.val();
					const vals = [];

					if (orgs && !Array.isArray(orgs)) {
						orgs = [orgs]
					}

					console.log(orgs[0].path);
        });
    }
}
