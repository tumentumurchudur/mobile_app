import { Injectable } from "@angular/core";
import { Effect, Actions } from "@ngrx/effects";

import { StoreServices } from "../../store/services";

import { Observable } from "rxjs/rx";
import { Subscription } from "rxjs/Subscription";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/observable/combineLatest";

import { DatabaseProvider } from "../../providers";
import { neighborhoodConfigs } from "../../configs";

import { TRIGGER_COMPARISON_READS, AddComparison } from "../actions";
import { IComparison } from "../../interfaces";
import { ChartHelper, CostHelper } from "../../helpers";

@Injectable()
export class ComparisonEffects {
  @Effect()
  public getNeighborhoodReads$ = this._actions$
    .ofType(TRIGGER_COMPARISON_READS)
    .map((action: any) => action.payload)
    .switchMap((data: any) => {
      const { meter, dateRange } = data;

      let group = null;
      const subscription: Subscription = this._storeServices.selectComparisonReads()
        .subscribe((data: IComparison[]) => {
          group = data && data.length ? data[0].group : null;
        });

      return Observable.combineLatest(
        Observable.of(meter),
        Observable.of(dateRange),
        group ? Observable.of(group) : this._db.getNeighborhoodGroupIds(meter),
        Observable.of(subscription)
      );
    })
    .switchMap((data: any) => {
      const [ meter, dateRange, group, groupSubscription ] = data;
      const { startDate, endDate } = dateRange;

      if (groupSubscription) {
        groupSubscription.unsubscribe();
      }

      const neighborhoodGroupID = group["group_id"] || null;
      const ncmpAvgGuid = `${neighborhoodGroupID}${neighborhoodConfigs.NEIGHBORHOOD_COMP_AVG_GUID}`;
      const ncmpEffGuid = `${neighborhoodGroupID}${neighborhoodConfigs.NEIGHBORHOOD_COMP_EFF_GUID}`;

      // Check if data is available in the store.
      let storeData;
      const subscription: Subscription = this._storeServices.selectComparisonReads()
        .subscribe((data: IComparison[]) => {
          storeData = data.filter(read => {
            return read.guid === meter._guid &&
              read.startDate.toString() === startDate.toString() &&
              read.endDate.toString() === endDate.toString();
          })[0] || null;
      });

      return Observable.combineLatest(
        Observable.of(subscription),
        Observable.of(group),
        Observable.of(meter),
        Observable.of(dateRange),
        storeData ? Observable.of(storeData.usage) : this._db.getReadsByDateRange(meter._guid, startDate, endDate),
        storeData ? Observable.of(storeData.avg) : this._db.getReadsByNeighborhood(ncmpAvgGuid, startDate, endDate),
        storeData ? Observable.of(storeData.eff) : this._db.getReadsByNeighborhood(ncmpEffGuid, startDate, endDate)
      );
    })
    .map((data: any[]) => {
      const [subscription, group, meter, dateRange, usage, avg, eff] = data;

      if (subscription) {
        subscription.unsubscribe();
      }

      if (!usage.length && !avg.length && !eff.length) {
        return new AddComparison(null);
      }

      // format data for average
      let avgDeltas = [];
      if (avg && avg.length) {
        const avgLineData = avg.map(d => {
          return {
            date: d.date,
            line1: d.delta
          }
        });

        // group data by time span
        avgDeltas = ChartHelper.groupDeltasByTimeSpan(dateRange, avgLineData);
      }

      // efficiency data
      let effDeltas = [];
      if (eff && eff.length) {
        const effLineData = eff.map(d => {
          return {
            date: d.date,
            line1: d.delta
          }
        });
        effDeltas = ChartHelper.groupDeltasByTimeSpan(dateRange, effLineData);
      }

      // consumption data
      let useDeltas = [];
      if (usage && usage.length) {
        const rawDeltas = ChartHelper.getDeltas(usage);
        const normalizedDeltas = ChartHelper.normalizeData(rawDeltas);

        useDeltas = normalizedDeltas.length ? ChartHelper.groupDeltasByTimeSpan(dateRange, normalizedDeltas) : [];
        const useCost = rawDeltas.length ? CostHelper.calculateCostFromDeltas(meter, rawDeltas) : {};
        console.log("cost", useCost);
      }

      let calcReads = [];
      let loopDeltas;
      if (useDeltas.length) {
        loopDeltas = useDeltas;
      } else if (avgDeltas.length) {
        loopDeltas = avgDeltas;
      } else {
        loopDeltas = effDeltas;
      }

      for (let i = 0; i < loopDeltas.length; i++) {
        if (!useDeltas.length) {
          calcReads.push({
            date: loopDeltas[i].date,
            line2: avgDeltas[i].line1 || 0,
            line3: effDeltas[i].line1 || 0
          });
        } else if (!avgDeltas.length) {
          calcReads.push({
            date: loopDeltas[i].date,
            line1: useDeltas[i].line1 || 0,
            line3: effDeltas[i].line1 || 0
          });
        } else if (!effDeltas.length) {
          calcReads.push({
            date: loopDeltas[i].date,
            line1: useDeltas[i].line1 || 0,
            line2: avgDeltas[i].line1 || 0
          });
        } else {
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
        group,
        usage,
        avg,
        eff,
        calcReads
      };

      return new AddComparison(payload);
    });

  constructor(
    private readonly _actions$: Actions,
    private readonly _db: DatabaseProvider,
    private readonly _storeServices: StoreServices
  ) { }
}
