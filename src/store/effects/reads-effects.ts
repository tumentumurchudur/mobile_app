import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";
import { Storage } from "@ionic/storage";

import { StoreServices } from "../../store/services";

import { Observable } from "rxjs/rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/timeout";

import { DatabaseProvider } from "../../providers";
import { IReads, IDateRange } from "../../interfaces";
import { environment } from "../../environments";

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
    .switchMap((data: any) => {
      if (!data || !data.meter) {
        return Observable.combineLatest([
          Observable.of(null),
          Observable.of([]),
          Observable.of(null)
        ]);
      } else {
        const { meter = null, user = null } = data;

        return Observable.combineLatest([
          Observable.of(meter),
          // Gets reads from database for given meter.
          this._db.getReadsForMeter(meter._guid, meter._billing_start),
          Observable.of(user)
        ]);
      }
    })
    .map((values: any[]) => {
      const [ meter = null, reads = [], user = null ] = values;

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

      // Update local storage.
      this._storage.get(user.uid).then(cachedData => {
        const { meters = [] } = cachedData;

        for (let meter of meters) {
          if (meter._guid === newMeter._guid && meter._name === newMeter._name) {
            meter = newMeter;
            break;
          }
        }
        this._storage.set(user.uid, { meters });
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
    .switchMap((data: any) => {
      const { meters = [], user = null } = data;

      return Observable.combineLatest([
        this._db.getReadsForMeters(meters),
        Observable.of(user)
      ]);
    })
    .map((values: any[]) => {
      const [ meters = [], user = null ] = values;

      // Calculates actual cost and usage.
      const newMeters = meters.length ? CostHelper.calculateCostAndUsageForMeters(meters) : [];

      // Updates local storage with new meters data.
      this._storage.set(user.uid, { meters: newMeters, lastUpdatedDate: new Date() });

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
    .debounceTime(250)
    .switchMap((values: any) => {
      const { meter, dateRange } = values;

      return Observable.combineLatest([
        Observable.of(meter),
        Observable.of(dateRange),
        this._storeServices.selectReadsData().take(1),
      ]);
    })
    .switchMap((data: any[]) => {
      const [ meter, dateRange, reads = [] ] = data;
      const { startDate, endDate } = dateRange;

      // if (reads.length) {
      //   this._storage.set('data', reads);
      // }
      //
      // console.log('reads', reads);
      // console.log('meter', meter);

      // Get reads data from the store if available.
      const storeData = reads.find(read => {
        return read.guid === meter._guid &&
          read.startDate.toString() === startDate.toString() &&
          read.endDate.toString() === endDate.toString();
      });

      const isDataAvail = storeData && !storeData.timedOut;

      return Observable.combineLatest([
        Observable.of(meter),
        Observable.of(dateRange),
        Observable.of(reads),
        // if data is available in the store, pass it down. Otherwise, get it from Firebase.
        isDataAvail ? Observable.of(storeData) : this._db.getReadsByDateRange(meter._guid, dateRange),
        Observable.of(isDataAvail)
      ])
      .take(1)
      .timeout(environment.apiTimeout) // Times out if nothing comes back.
      .catch(error => Observable.of([meter, dateRange, [], false, true]));
    })
    .map((values: any[]) => {
      const [ meter, dateRange, reads, data, isDataAvail = false, timedOut = false ] = values;
      const { startDate, endDate } = dateRange;

      if (isDataAvail) {
        return new AddReads(null);
      }

      if (timedOut) {
        const payload = {
          guid: meter._guid,
          startDate,
          endDate,
          deltas: [],
          cost: null,
          timedOut
        } as IReads;

        return new AddReads(payload);
      }

      const rawDeltas = data.length ? ChartHelper.getDeltas(data) : [];

        // Removes abnormally large values.
      const normalizedDeltas = rawDeltas.length ? ChartHelper.normalizeData(rawDeltas) : [];

      // Puts values into date buckets by time span.
      const deltas = normalizedDeltas.length ? ChartHelper.groupDeltasByTimeSpan(dateRange, normalizedDeltas) : [];
      const cost = rawDeltas.length ? CostHelper.calculateCostFromDeltas(meter, rawDeltas) : 0;

      const payload = {
        guid: meter._guid,
        startDate,
        endDate,
        deltas,
        cost,
        timedOut
      } as IReads;

      console.log("payload", payload);
      console.log("reads", reads);
      console.log("reads concat", reads.concat(payload));

       const readsData = reads.concat(payload);

      this._storage.set(`readsData`, readsData);

      return new AddReads(payload);
    });

    constructor(
      private readonly _actions$: Actions,
      private readonly _db: DatabaseProvider,
      private readonly _storeServices: StoreServices,
      private readonly _storage: Storage
    ) { }
}
