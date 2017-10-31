import { Injectable } from '@angular/core';
import { Effect, Actions } from "@ngrx/effects";
import { Action } from "@ngrx/store";

import { Observable } from 'rxjs/rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { LOAD_METERS, AddMeters, CalcMeters } from "../actions";
import { DatabaseProvider } from '../../providers';
import { IMeter } from '../../interfaces';

@Injectable()
export class MainEffects {

  @Effect() public loadMetersData = this._actions$
    .ofType(LOAD_METERS)
    .switchMap((action: any) => {
      return this._db.getOrgPathForUser(action.payload);
    })
    .switchMap((path: string) => {
      return this._db.getMetersForOrg(path);
    })
    .switchMap((meters: IMeter[]) => {
      return this._db.getReadsForMeters(meters);
    })
    .map((reads: IMeter[]) => {
      return new CalcMeters(reads);
    });
    // .mergeMap((reads: IMeter[]) => {
    //   return [
    //     new AddMeters(reads),
    //     new CalcMeters(reads)
    //   ];
    // });

  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider
  ) { }

}
