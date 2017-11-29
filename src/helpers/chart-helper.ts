import { Injectable } from "@angular/core";
import { IRead, ILineItem, IDateRange } from "../interfaces";
import { timeSpanConfigs } from "../configs";
import * as moment from "moment";

export class ChartHelper {
  public static getDelta(data: IRead[]): ILineItem[] {
    const chartData = [];

    for(let i = data.length - 1; i >= 0; i--) {
      if (i - 1 >= 0) {
        const diff = data[i].total - data[i-1].total;

        chartData.push({
          date: new Date(parseInt(data[i].date.toString())),
          line1: diff
        });
      }
    }
    return chartData;
  }

  public static normalizeLineChartData(data: ILineItem[]) {
    let reducedSummaries = [];
    const maxCount = 60;
    const tolerance = .5;

    // Remove elements from array if length exceeds maxCount.
    if (data.length >= maxCount) {
      const middleIndex = data.length / 2;
      const startIndex = middleIndex - (maxCount * .5);
      const endIndex = middleIndex + (maxCount * .5);

      reducedSummaries = data.slice(startIndex, endIndex);
    } else {
      reducedSummaries = Object.assign([], data);
    }

    // Normalize data in summaries array.
    const allValues = reducedSummaries.map((s: ILineItem) => s.line1);
    const max = Math.max.apply(0, allValues);
    const largeValues = allValues.filter(val => val <= max && val >= max * tolerance);

    // Check if abnormal values are less than 10% of all values.
    if (largeValues.length < allValues.length * .1) {
      // Remove abnormally large values from summaries array.
      return reducedSummaries.filter(s => {
        return largeValues.indexOf(s.line1) === -1 && s.line1 > 0;
      });
    }
    return reducedSummaries;
  }

  public static getDateRange(direction: string, dateRange: IDateRange): IDateRange {
    let startDate;
    let endDate;

    switch(dateRange.timeSpan) {
      case timeSpanConfigs.MONTH:
        startDate = !dateRange.startDate
          ? moment().startOf("month")
          : moment(dateRange.startDate).add(direction === "prev" ? -1 : 1, "M");

        endDate = !dateRange.endDate
          ? moment().endOf("month")
          : moment(dateRange.endDate).add(direction === "prev" ? -1 : 1, "M");

        break;
      case timeSpanConfigs.DAY:
        break;
      case timeSpanConfigs.WEEK:
      case timeSpanConfigs.HOUR:
      case timeSpanConfigs.YEAR:
      default:
        break;
    }

    return {
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      timeSpan: dateRange.timeSpan
    }
  }

}
