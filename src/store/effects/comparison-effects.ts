import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";

import { StoreServices } from "../../store/services";

import { Observable } from "rxjs/rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/timeout";

import { DatabaseProvider } from "../../providers";
import { neighborhoodConfigs } from "../../configs";
import { environment } from "../../environments";

import {
  CHECK_COMPARISON_READS,
  BEGIN_COMPARISON_READS,
  TRIGGER_COMPARISON_READS,

  AddComparison,
  BeginComparisonReads,
  CheckComparisonReads,
  AddNeighborhoodGroup
} from "../actions";

import { IComparison, IMeter, IDateRange } from "../../interfaces";
import { ChartHelper, CostHelper } from "../../helpers";

@Injectable()
export class ComparisonEffects {
  @Effect()
  public getNeighborhoodReads$ = this._actions$
    .ofType(TRIGGER_COMPARISON_READS)
    .map((action: any) => action.payload)
    .debounceTime(250)
    .switchMap((data: any) => {
      const { meter, dateRange } = data;

      return Observable.combineLatest(
        this._db.getNeighborhoodGroup(meter),
        Observable.of(meter),
        Observable.of(dateRange)
      );
    })
    .switchMap((data: any[]) => {
      const [ group, meter, dateRange ] = data;

      const neighborhoodGroupID = group && group.group_id ? group.group_id : null;
      const ncmpAvgGuid = neighborhoodGroupID ? `${neighborhoodGroupID}${neighborhoodConfigs.NEIGHBORHOOD_COMP_AVG_GUID}` : null;
      const ncmpEffGuid = neighborhoodGroupID ? `${neighborhoodGroupID}${neighborhoodConfigs.NEIGHBORHOOD_COMP_EFF_GUID}` : null;

      return Observable.combineLatest([
        Observable.of(meter),
        Observable.of(dateRange),
        this._storeServices.selectComparisonReads().take(1),
        ncmpAvgGuid ? Observable.of(ncmpAvgGuid) : Observable.of(null),
        ncmpEffGuid ? Observable.of(ncmpEffGuid) : Observable.of(null)
      ]);
    })
    .map((data: any) => {
      const [ meter, dateRange, reads, ncmpAvgGuid, ncmpEffGuid ] = data;

      return new CheckComparisonReads([meter, dateRange, reads, ncmpAvgGuid, ncmpEffGuid]);
    });


    @Effect()
    public checkNeighborhoodReads$ = this._actions$
      .ofType(CHECK_COMPARISON_READS)
      .map((action: any) => action.payload)
      .map((data: any[]) => {
        const [ meter, dateRange, reads, ncmpAvgGuid, ncmpEffGuid ] = data;
        const { startDate, endDate } = dateRange;

        // Check if data is available in the store.
        const storeData = reads.find(read => {
          return read.guid === meter._guid &&
            read.startDate.toString() === startDate.toString() &&
            read.endDate.toString() === endDate.toString();
        });

        const avgCosts = storeData ? storeData.avgCosts : null;
        const effCosts = storeData ? storeData.effCosts : null;
        const usageCosts = storeData ? storeData.usageCosts : null;
        const calcReads = storeData ? storeData.calcReads : [];
        const timedOut = storeData ? storeData.timedOut : false;

        if (timedOut) {
          const payload: IComparison = {
            guid: meter._guid,
            startDate,
            endDate,
            usageCosts,
            avgCosts,
            effCosts,
            calcReads,
            rank: storeData.rank,
            timedOut
          };

          // Request has timed out.
          return new AddComparison(payload);
        }

        if (avgCosts && effCosts && calcReads.length) {
          // Get data from store.
          return new AddComparison(null);
        }

        // Get data from API.
        return new BeginComparisonReads([meter, dateRange, ncmpAvgGuid, ncmpEffGuid]);
      });

      @Effect()
      public beginNeighborhoodReads$ = this._actions$
        .ofType(BEGIN_COMPARISON_READS)
        .map((action: any) => action.payload)
        .switchMap((data: any[]) => {
          const [ meter, dateRange, ncmpAvgGuid, ncmpEffGuid ] = data;

          return Observable.combineLatest([
            Observable.of(meter),
            Observable.of(dateRange),
            this._db.getReadsByDateRange(meter._guid, dateRange),
            this._db.getReadsByNeighborhood(ncmpAvgGuid, dateRange),
            this._db.getReadsByNeighborhood(ncmpEffGuid, dateRange),
            this._db.getNeighborhoodComparisonRanks(meter, dateRange),
            // Whether or not request has timed out.
            Observable.of(false)
          ])
          .take(1)
          .timeout(environment.apiTimeout) // Times out if nothing comes back.
          .catch(error => Observable.of([meter, dateRange, [], [], [], null, true]));
        })
        .map((data: any[]) => {
          const [ meter, dateRange, usage = [], avg = [], eff = [], rank, timedOut = false ] = data;
          const { startDate, endDate } = dateRange;

          // No need to display chart if avg and eff data is not available or request timed out.
          if ((!avg.length && !eff.length) || timedOut) {
            const payload = {
              guid: meter._guid,
              startDate,
              endDate,
              usageCosts: null,
              avgCosts: null,
              effCosts: null,
              calcReads: [],
              rank,
              timedOut
            };

            return new AddComparison(payload);
          }

          // Calculate deltas and costs of average data.
          const avgResult = this._calculateDeltasAndCosts(avg, dateRange, meter);
          const avgDeltas = avgResult.deltas;
          const avgCosts = avgResult.costs;

          // Calculate deltas and costs of efficiency data.
          const effResult = this._calculateDeltasAndCosts(eff, dateRange, meter);
          const effDeltas = effResult.deltas;
          const effCosts = effResult.costs;

          // consumption data
          let useDeltas = [];
          let usageCosts = null;
          if (usage.length) {
            const rawDeltas = ChartHelper.getDeltas(usage);
            const normalizedDeltas = ChartHelper.normalizeData(rawDeltas);

            useDeltas = normalizedDeltas.length ? ChartHelper.groupDeltasByTimeSpan(dateRange, normalizedDeltas) : [];
            usageCosts = rawDeltas.length ? CostHelper.calculateCostFromDeltas(meter, rawDeltas) : null;
          }

          const calcReads = [];
          const loopDeltas = useDeltas.length ? useDeltas : avgDeltas;

          for (let i = 0; i < loopDeltas.length; i++) {
            // Check if consumption data is available.
            // If not available, show average and efficiency data in chart only.
            if (!useDeltas.length) {
              calcReads.push({
                date: loopDeltas[i].date,
                line2: avgDeltas[i].line1 || 0,
                line3: effDeltas[i].line1 || 0
              });
            } else { // Data for all three charts is available.
              calcReads.push({
                date: loopDeltas[i].date,
                line1: effDeltas[i].line1 || 0,
                line2: useDeltas[i].line1 || 0,
                line3: avgDeltas[i].line1 || 0
              });
            }
          }

          const payload: IComparison = {
            guid: meter._guid,
            startDate,
            endDate,
            usageCosts,
            avgCosts,
            effCosts,
            calcReads,
            rank,
            timedOut
          };

          return new AddComparison(payload);
        });

  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider,
    private readonly _storeServices: StoreServices
  ) { }

  /**
   * Calculates deltas and costs from given array containing reads.
   *
   * TODO: Needs to declare an interface for the return type.
   * @param data
   * @param dateRange
   * @param meter
   */
  private _calculateDeltasAndCosts(data: any[], dateRange: IDateRange, meter: IMeter): { deltas: any[], costs: any } {
    let deltas = [];
    let costs = null;

    if (!data.length) {
      return { deltas: [], costs: null };
    }

    const lineData = data.map(d => {
      return {
        date: d.date,
        line1: d.delta
      };
    });

    // group efficiency data by time span
    deltas = ChartHelper.groupDeltasByTimeSpan(dateRange, lineData);
    costs = deltas.length ? CostHelper.calculateCostFromDeltas(meter, deltas) : null;

    return { deltas, costs };
  }

}
