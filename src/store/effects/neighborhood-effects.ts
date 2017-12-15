import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";

import { Observable } from "rxjs/rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/observable/fromPromise";

import { DatabaseProvider } from "../../providers";
import { neighborhoodConfigs } from "../../configs";

import { TRIGGER_NEIGHBORHOOD_READS, AddComparison } from "../actions";
import { IMeter, IComparison } from "../../interfaces";

@Injectable()
export class NeighborhoodEffects {
  @Effect()
  public reads$ = this._actions$
    .ofType(TRIGGER_NEIGHBORHOOD_READS)
    .map((action: any) => action.payload)
    .switchMap((meter: IMeter) => {
      return Observable.combineLatest(
        Observable.of(meter),
        this._db.getNeighborhoodGroupIds(meter)
      )
    })
    .switchMap((data: any) => {
      const [ meter, group ] = data;
      const neighborhoodGroupID = group["group_id"];
      const ncmpAvgGuid = `${neighborhoodGroupID}${neighborhoodConfigs.NEIGHBORHOOD_COMP_AVG_GUID}`;
      const ncmpEffGuid = `${neighborhoodGroupID}${neighborhoodConfigs.NEIGHBORHOOD_COMP_EFF_GUID}`;

      const newMeter = Object.assign({}, meter, {
        _ncmpAvgGuid: ncmpAvgGuid,
        _ncmpEffGuid: ncmpEffGuid
      });

      return Observable.combineLatest(
        Observable.of(newMeter),
        this._db.getReadsByDateRange(meter._guid, new Date("12/1/2017"), new Date("12/31/2017")),
        this._db.getReadsByNeighborhood(ncmpAvgGuid, new Date("12/1/2017"), new Date("12/31/2017")),
        this._db.getReadsByNeighborhood(ncmpEffGuid, new Date("12/1/2017"), new Date("12/31/2017"))
      );
    })
    .map((data: any[]) => {
      const [ meter, usage, avg, eff ] = data;
      const startDate = new Date("12/1/2017");
      const endDate = new Date("12/31/2017");

      console.log("data", usage, avg, eff);

      const payload: IComparison = {
        guid: meter._guid,
        startDate,
        endDate,
        usage,
        avg,
        eff
      };

      return new AddComparison(payload);
    });

  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider,
  ) { }
}
