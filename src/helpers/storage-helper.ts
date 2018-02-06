import { IReads, IDateRange } from "../interfaces";
import { timeSpanConfigs, timeSpanRetentionQty } from "../configs";
import * as moment from "moment";

export class StorageHelper {
  public static isWithinRetentionPolicy(dateRange: IDateRange): boolean {
      const startDate = moment(dateRange.startDate);

      switch (dateRange.timeSpan) {
        case timeSpanConfigs.MONTH:
          return moment().diff(startDate, "months") < timeSpanRetentionQty.MONTH;
        case timeSpanConfigs.WEEK:
          return moment().diff(startDate, "weeks") < timeSpanRetentionQty.WEEK;
        case timeSpanConfigs.DAY:
          return moment().diff(startDate, "days") < timeSpanRetentionQty.DAY;
        case timeSpanConfigs.HOUR:
          return moment().diff(startDate, "hours") < timeSpanRetentionQty.HOUR;
        case timeSpanConfigs.YEAR:
          return moment().diff(startDate, "years") < timeSpanRetentionQty.YEAR;
        default:
          return false;
      }
  }
}
