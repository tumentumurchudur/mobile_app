import { Injectable } from '@angular/core';
import { Effect, Actions } from "@ngrx/effects";
import { Action } from "@ngrx/store";

import { Observable } from 'rxjs/rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { LOAD_METERS, AddMeters } from "../actions";
import { DatabaseProvider } from '../../providers';
import { IMeter } from '../../interfaces';

import { CostHelper } from "../../helpers";

@Injectable()
export class MainEffects {
  /**
   * Handles effects to load data for given user using
   * database services.
   *
   * @memberof MainEffects
   */
  @Effect() public loadMetersData = this._actions$
    .ofType(LOAD_METERS)
    .map((action: any) => action.payload)
    .switchMap(uid => {
      return this._db.getOrgPathForUser(uid);
    })
    .switchMap((orgPath: string) => {
      return this._db.getMetersForOrg(orgPath);
    })
    .switchMap((meters: IMeter[]) => {
      return this._db.getReadsForMeters(meters);
    })
    .switchMap((meters: IMeter[]) => {
      return this._db.getProviderForMeters(meters);
    })
    .flatMap((meters: IMeter[]) => {
      // Sets sum of reads diffs to _usage property.
      this._helper.calcUsageDiffs(meters);

      // Sets actual usage cost to _actualUsageCost property.
      this._helper.calcUsageCost(meters);
      return [
        new AddMeters(meters)
      ];
    });

  /**
   * Creates an instance of MainEffects.
   * @param {Actions} _actions$
   * @param {DatabaseProvider} _db
   * @memberof MainEffects
   */
  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider,
    private readonly _helper: CostHelper
  ) { }

}
