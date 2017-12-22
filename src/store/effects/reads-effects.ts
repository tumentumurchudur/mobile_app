import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";

import { StoreServices } from "../../store/services";

import { Observable } from "rxjs/rx";
import { Subscription } from "rxjs/Subscription";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";

import { DatabaseProvider } from "../../providers";
import { IMeter, IReads, IDateRange } from "../../interfaces";

import { CostHelper, ChartHelper } from "../../helpers";
import {
  TRIGGER_UPDATE_METER_READS,
  LOAD_READS_BY_METERS,
  LOAD_READS_BY_DATE,

  AddMeters,
  UpdateMeter,
  AddReads
} from "../actions";

@Injectable()
export class ReadsEffects {
  /**
   * Handles TRIGGER_UPDATE_METER_READS action and
   * updates reads and consumption cost for a particular meter.
   */
  @Effect()
  public updateReadsForAMeter$ = this._actions$
    .ofType(TRIGGER_UPDATE_METER_READS)
    .map((action: any) => action.payload)
    .switchMap((meter: IMeter) => {
      if (!meter) {
        return Observable.combineLatest([
          Observable.of(null),
          Observable.of([])
        ]);
      } else {
        return Observable.combineLatest([
          Observable.of(meter),
          // Gets reads from database for given meter.
          this._db.getReadsForMeter(meter._guid, meter._billing_start)
        ]);
      }
    })
    .map((values: any[]) => {
      const [ meter, reads ] = values;

      if (!meter) {
        // Nothing gets updated.
        return new UpdateMeter(null);
      }

      const deltas = ChartHelper.getDeltas(reads);
      const cost = deltas.length ? CostHelper.calculateCostFromDeltas(meter, deltas) : {};

      const newMeter = Object.assign({}, meter, {
        _actualUsageCost: cost.totalCost || 0,
        _usage: cost.totalDelta || 0
      });

      return new UpdateMeter(newMeter);
    });

  /**
   * Handles LOAD_READS_BY_METERS action and
   * updates reads for all meters.
   */
  @Effect()
  public updateReadsForAllMeters$ = this._actions$
    .ofType(LOAD_READS_BY_METERS)
    .map((action: any) => action.payload)
    .switchMap((meters: IMeter[]) => {
      return Observable.combineLatest([
        this._db.getReadsForMeters(meters)
      ]);
    })
    .map((values: any[]) => {
      const [ meters = [] ] = values;

      // Calculates actual cost and usage.
      const newMeters = CostHelper.calculateCostAndUsageForMeters(meters);

      return new AddMeters(newMeters);
    });

  /**
   * Handles LOAD_READS_BY_DATE action and
   * updates reads in the store using meter guid, start and end dates.
   */
  @Effect()
  public updateReadsByDate$ = this._actions$
    .ofType(LOAD_READS_BY_DATE)
    .map((action: any) => action.payload)
    .switchMap((values: any) => {
      const { meter, timeSpan, startDate, endDate } = values;

      // Get reads data from the store if available.
      let storeData;
      const subscription: Subscription = this._storeServices.selectReadsData().subscribe((data: IReads[]) => {
        storeData = data.filter(read => {
          return read.guid === meter._guid &&
            read.startDate.toString() === startDate.toString() &&
            read.endDate.toString() === endDate.toString();
        })[0] || null;
      });

      const reads = storeData ? Observable.of(storeData.reads) : this._db.getReadsByDateRange(meter._guid, startDate, endDate);

      return Observable.combineLatest([
        Observable.of(meter),
        Observable.of(timeSpan),
        Observable.of(startDate),
        Observable.of(endDate),
        reads,
        // Needs subscription to the store observable,
        // so it can be unsubscribed to prevent memory leaks.
        Observable.of(subscription)
      ]);
    })
    .map(values => {
      const [ meter, timeSpan, startDate, endDate, reads, subscription ] = values;

      if (subscription) {
        subscription.unsubscribe();
      }

      const rawDeltas = ChartHelper.getDeltas(reads);

      const dateRange: IDateRange = { timeSpan, startDate, endDate };
      const normalizedDeltas = ChartHelper.normalizeData(rawDeltas);
      const deltas = normalizedDeltas.length ? ChartHelper.groupDeltasByTimeSpan(dateRange, normalizedDeltas) : [];
      const cost = rawDeltas.length ? CostHelper.calculateCostFromDeltas(meter, rawDeltas) : 0;

      const payload = {
        guid: meter._guid,
        startDate,
        endDate,
        reads: reads,
        deltas: deltas,
        cost: cost
      } as IReads;

      return new AddReads(payload);
    });

    constructor(
      private readonly _actions$: Actions,
      private readonly _db: DatabaseProvider,
      private readonly _storeServices: StoreServices
    ) { }
}
