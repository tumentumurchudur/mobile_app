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

import { TRIGGER_COMPARISON_READS, AddComparison, AddNeighborhoodGroup } from "../actions";
import { IComparison, IMeter } from "../../interfaces";
import { ChartHelper, CostHelper } from "../../helpers";
import { IDateRange } from "../../interfaces/date-range";

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
        this._storeServices.selectComparisonGroup().take(1),
        Observable.of(meter),
        Observable.of(dateRange)
      );
    })
    .switchMap((data: any[]) => {
      const [ group, meter, dateRange ] = data;

      return Observable.combineLatest([
        Object.keys(group).length ? Observable.of(group) : this._db.getNeighborhoodGroup(meter),
        Observable.of(meter),
        Observable.of(dateRange)
      ]);
    })
    .switchMap((data: any[]) => {
      const [ group, meter, dateRange ] = data;

      const neighborhoodGroupID = group && group.group_id ? group.group_id : null;
      const ncmpAvgGuid = neighborhoodGroupID ? `${neighborhoodGroupID}${neighborhoodConfigs.NEIGHBORHOOD_COMP_AVG_GUID}` : null;
      const ncmpEffGuid = neighborhoodGroupID ? `${neighborhoodGroupID}${neighborhoodConfigs.NEIGHBORHOOD_COMP_EFF_GUID}` : null;

      return Observable.combineLatest([
        Observable.of(group),
        Observable.of(meter),
        Observable.of(dateRange),
        this._storeServices.selectComparisonReads().take(1),
        ncmpAvgGuid ? Observable.of(ncmpAvgGuid) : Observable.of(null),
        ncmpEffGuid ? Observable.of(ncmpEffGuid) : Observable.of(null)
      ]);
    })
    .switchMap((data: any[]) => {
      const [ group, meter, dateRange, reads, ncmpAvgGuid, ncmpEffGuid ] = data;
      const { startDate, endDate } = dateRange;

      // Check if data is available in the store.
      const storeData = reads.find(read => {
        return read.guid === meter._guid &&
          read.startDate.toString() === startDate.toString() &&
          read.endDate.toString() === endDate.toString();
      });

      return Observable.combineLatest([
        Observable.of(group),
        Observable.of(meter),
        Observable.of(dateRange),
        storeData ? Observable.of(storeData.usage) : this._db.getReadsByDateRange(meter._guid, dateRange),
        storeData ? Observable.of(storeData.avg) : (ncmpAvgGuid ? this._db.getReadsByNeighborhood(ncmpAvgGuid, dateRange) : Observable.of([])),
        storeData ? Observable.of(storeData.eff) : (ncmpEffGuid ? this._db.getReadsByNeighborhood(ncmpEffGuid, dateRange) : Observable.of([])),
        storeData ? Observable.of(storeData.rank) : this._db.getNeighborhoodComparisonRanks(meter, dateRange)
      ])
      .timeout(environment.apiTimeout) // Times out if nothing comes back.
      .catch(error => Observable.of([meter, group, dateRange, [], [], [], null, true]));
    })
    .flatMap((data: any[]) => {
      const [group, meter, dateRange, usage = [], avg = [], eff = [], rank, timedOut = false] = data;

      if (timedOut) {
        return [new AddComparison(null)];
      }

      // No need to display chart if avg and eff data is not available.
      if (!avg.length && !eff.length) {
        const payload = {
          guid: meter._guid,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          usage: [],
          usageCosts: null,
          avg: [],
          avgCosts: null,
          eff: [],
          effCosts: null,
          calcReads: [],
          rank: null
        };

        return [
          new AddNeighborhoodGroup(group),
          new AddComparison(payload)
        ];
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

      let calcReads = [];
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
        }
        // Data for all three charts is available.
        else {
          calcReads.push({
            date: loopDeltas[i].date,
            line1: useDeltas[i].line1 || 0,
            line2: avgDeltas[i].line1 || 0,
            line3: effDeltas[i].line1 || 0
          });
        }
      }

      const payload: IComparison = {
        guid: meter._guid,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        usage,
        usageCosts,
        avg,
        avgCosts,
        eff,
        effCosts,
        calcReads,
        rank
      };

      return [
        new AddNeighborhoodGroup(group),
        new AddComparison(payload)
      ];
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
      }
    });

    // group efficiency data by time span
    deltas = ChartHelper.groupDeltasByTimeSpan(dateRange, lineData);
    costs = deltas.length ? CostHelper.calculateCostFromDeltas(meter, deltas) : null;

    return { deltas, costs };
  }

}
