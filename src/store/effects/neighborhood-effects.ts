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
import { IMeter, IComparison, IDateRange } from "../../interfaces";
import { ChartHelper } from "../../helpers/chart-helper";

@Injectable()
export class NeighborhoodEffects {
  @Effect()
  public reads$ = this._actions$
    .ofType(TRIGGER_NEIGHBORHOOD_READS)
    .map((action: any) => action.payload)
    .switchMap((data: any) => {
      const { meter, timeSpan, startDate, endDate } = data;

      return Observable.combineLatest(
        Observable.of(meter),
        Observable.of(timeSpan),
        Observable.of(startDate),
        Observable.of(endDate),
        this._db.getNeighborhoodGroupIds(meter)
      )
    })
    .switchMap((data: any) => {
      const [ meter, timeSpan, startDate, endDate, group ] = data;
      const neighborhoodGroupID = group["group_id"];
      const ncmpAvgGuid = `${neighborhoodGroupID}${neighborhoodConfigs.NEIGHBORHOOD_COMP_AVG_GUID}`;
      const ncmpEffGuid = `${neighborhoodGroupID}${neighborhoodConfigs.NEIGHBORHOOD_COMP_EFF_GUID}`;

      const newMeter = Object.assign({}, meter, {
        _ncmpAvgGuid: ncmpAvgGuid,
        _ncmpEffGuid: ncmpEffGuid
      });
      console.log(timeSpan, startDate, endDate);

      return Observable.combineLatest(
        Observable.of(newMeter),
        Observable.of(timeSpan),
        Observable.of(startDate),
        Observable.of(endDate),
        this._db.getReadsByDateRange(meter._guid, startDate, endDate),
        this._db.getReadsByNeighborhood(ncmpAvgGuid, startDate, endDate),
        this._db.getReadsByNeighborhood(ncmpEffGuid, startDate, endDate)
      );
    })
    .map((data: any[]) => {
      const [ meter, timeSpan, startDate, endDate, usage, avg, eff ] = data;

      const dateRange: IDateRange = { timeSpan, startDate, endDate };
      const avgLineData = avg.map(d => {
        return {
          date: d.date,
          line1: d.delta
        }
      });
      const effLineData = eff.map(d => {
        return {
          date: d.date,
          line1: d.delta
        }
      });
      const avgDeltas = ChartHelper.groupDeltasByTimeSpan(dateRange, avgLineData);
      const effDeltas = ChartHelper.groupDeltasByTimeSpan(dateRange, effLineData);
      let combineAvgEff = [];

      for (let i = 0; i < avgDeltas.length; i++) {
        if (avgDeltas[i].date.toString() === effDeltas[i].date.toString()) {
          combineAvgEff.push({
            date: avgDeltas[i].date,
            line1: avgDeltas[i].line1 || 0,
            line2: effDeltas[i].line1 || 0
          });
        }
      }

      console.log("data", avgDeltas, effDeltas, combineAvgEff);

      const payload: IComparison = {
        guid: meter._guid,
        startDate,
        endDate,
        usage,
        avg: combineAvgEff,
        eff
      };

      return new AddComparison(payload);
    });

  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider,
  ) { }
}
