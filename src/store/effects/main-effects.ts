import { Injectable } from '@angular/core';
import { Effect, Actions } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import { Storage } from "@ionic/storage";

import { Observable } from "rxjs/rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/observable/fromPromise";

import { DatabaseProvider } from "../../providers";
import { IMeter, IUser, IReads } from "../../interfaces";

import { CostHelper, ChartHelper } from "../../helpers";
import {
  LOAD_METERS,
  LOAD_FROM_DB,
  LOAD_READS_FROM_DB,
  LOAD_READS_BY_DATE,
  ADD_SUMMARIES,
  LOAD_SUMMARIES,
  AddMeters,
  LoadFromDb,
  AddReads,
  AddSummaries,
  AddUser,
  UpdateUser
} from "../actions";
import { IReadSummaries } from '../../interfaces/read-summaries';
import { IDateRange } from '../../interfaces/date-range';

@Injectable()
export class MainEffects {
  /**
   * Handles load meters action.
   *
   * Updates the store with data from cache if found.
   * Otherwise, dispatch load from db action to fetch from the API.
   *
   * @memberof MainEffects
   */
  @Effect()
  public checkCacheAndThenLoadData = this._actions$
    .ofType(LOAD_METERS)
    .map((action: any) => action.payload)
    .switchMap((user: IUser) => {
      return Observable.combineLatest(
        Observable.fromPromise(
          // Check if meter data is stored locally by uid as key.
          this._storage.get(user.uid).then(meters => {
            return meters && meters.length ? meters : [];
          })
        ),
        Observable.of(user)
      );
    })
    .map((values: any[]) => {
      const [meters = [], user] = values;

      // Load data from API.
      if (!meters.length) {
        return new LoadFromDb(user);
      }
      // Load data from cache.
      return new AddMeters(meters);
    });

  /**
   * Handles load from database action.
   *
   * Fetches meter data from Firebase using uid.
   *
   * @memberof MainEffects
   */
  @Effect()
  public loadMetersDataFromDb = this._actions$
    .ofType(LOAD_FROM_DB)
    .map((action: any) => action.payload)
    .switchMap((user: IUser) => {
      return Observable.combineLatest([
        this._db.getOrgPathForUser(user.uid),
        Observable.of(user)
      ]);
    })
    .switchMap((values: any[]) => {
      const [orgPath, user] = values;
      const updatedUser = Object.assign({}, user, { orgPath });

      return Observable.combineLatest([
        this._db.getMetersForOrg(orgPath),
        Observable.of(updatedUser)
      ]);
    })
    .switchMap((values: any[]) => {
      const [meters, user] = values;

      return Observable.combineLatest([
        this._db.getReadsForMeters(meters),
        Observable.of(user)
      ]);
    })
    .switchMap((values: any[]) => {
      const [meters, user] = values;

      return Observable.combineLatest([
        this._db.getProviderForMeters(meters),
        Observable.of(user)
      ]);
    })
    .flatMap((values: any[]) => {
      const [meters, user] = values;

      // Sets sum of reads diffs to _usage property.
      this._helper.calcUsageDiffs(meters);

      // Sets actual usage cost to _actualUsageCost property.
      this._helper.calcUsageCost(meters);

      // Store meter data locally by uid as key.
      this._storage.set(user.uid, meters);

      // Dispatch actions to update the store.
      return [
        new AddMeters(meters),
        new UpdateUser(user)
      ];
    });

  @Effect()
  public refreshReadsDataFromDb = this._actions$
    .ofType(LOAD_READS_FROM_DB)
    .map((action: any) => action.payload)
    .switchMap((meters: IMeter[]) => {
      return Observable.combineLatest([
        this._db.getReadsForMeters(meters)
      ]);
    })
    .map((values: any[]) => {
      const [ meters = [] ] = values;

      return new AddMeters(meters);
    });

    @Effect()
    public loadSummaries = this._actions$
      .ofType(LOAD_SUMMARIES)
      .map((action: any) => action.payload)
      .switchMap((data: IReadSummaries) => {
        return Observable.combineLatest([
          Observable.of(data.guid),
          Observable.of(data.timeSpan),
          this._db.getSummaries(data.guid, data.timeSpan)
        ]);
      })
      .map((data: any[]) => {
        const [ guid, timeSpan, summaries ] = data;
        const normalizedSummaries = ChartHelper.normalizeLineChartData(summaries);

        return new AddSummaries({
          guid: guid,
          timeSpan: timeSpan,
          summaries: normalizedSummaries
        });
      });

    @Effect()
    public loadReadsByDate = this._actions$
      .ofType(LOAD_READS_BY_DATE)
      .map((action: any) => action.payload)
      .switchMap((values: any) => {
        const { guid, timeSpan, startDate, endDate } = values;

        return Observable.combineLatest([
          Observable.of(guid),
          Observable.of(timeSpan),
          Observable.of(startDate),
          Observable.of(endDate),
          this._db.getReadsByDateRange(guid, startDate, endDate)
        ]);
      })
      .map(values => {
        const [ guid, timeSpan, startDate, endDate, reads ] = values;
        const deltas = ChartHelper.getDelta(reads);

        // const normalizedDeltas = ChartHelper.normalizeLineChartData(deltas);

        const dateRange: IDateRange = { timeSpan, startDate, endDate };
        const normalizedDeltas = ChartHelper.normalizeReads(dateRange, deltas);

        const payload = {
          guid,
          startDate,
          endDate,
          reads: reads,
          deltas: normalizedDeltas
        } as IReads;

        return new AddReads(payload);
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
    private readonly _helper: CostHelper,
    private readonly _storage: Storage
  ) { }

}
