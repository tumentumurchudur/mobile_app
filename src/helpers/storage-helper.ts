import { IReads, IDateRange } from "../interfaces";
import { timeSpanConfigs, timeSpanRetentionQty } from "../configs";
import * as moment from "moment";

export class StorageHelper {
  public static retentionPolicy( read: IReads, dateRange: IDateRange, storageObj: IReads[]): Promise<IReads[]> {
    return new Promise((resolve, reject) => {
      const startDate = moment(dateRange.startDate);

      switch (dateRange.timeSpan) {
        case timeSpanConfigs.MONTH:
          if (moment().diff(startDate, "months") < timeSpanRetentionQty.MONTH) {
            storageObj = storageObj.concat(read);
            resolve(storageObj);
          }
          break;
        case timeSpanConfigs.WEEK:
          if (moment().diff(startDate, "weeks") < timeSpanRetentionQty.WEEK) {
            storageObj = storageObj.concat(read);
            resolve(storageObj);
          }
          break;
        case timeSpanConfigs.DAY:
          if (moment().diff(startDate, "days") < timeSpanRetentionQty.DAY) {
            storageObj = storageObj.concat(read);
            resolve(storageObj);
          }
          break;
        case timeSpanConfigs.HOUR:
          if (moment().diff(startDate, "hours") < timeSpanRetentionQty.HOUR) {
            storageObj = storageObj.concat(read);
            resolve(storageObj);
          }
          break;
        case timeSpanConfigs.YEAR:
          if (moment().diff(startDate, "years") < timeSpanRetentionQty.YEAR) {
            storageObj = storageObj.concat(read);
            resolve(storageObj);
          }
          break;
        default:
          reject("Not a proper date range");
      }
    });
  }
}
