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

  public static normalizeReads(dateRange: IDateRange, data: ILineItem[]) {
    let { startDate, endDate, timeSpan } = dateRange;
    const dataPoints = [];

    switch(timeSpan) {
      case timeSpanConfigs.MONTH:
        while(startDate < endDate) {
          const startDay = moment(startDate).startOf("day").toDate();
          const endDay = moment(startDate).endOf("day").toDate();

          const points = data.filter(d => d.date >= startDay && d.date <= endDay);
          const total = points.reduce((a, b) => { return a + b.line1 }, 0);

          dataPoints.push({ date: startDay, line1: total });

          startDate = moment(startDate).add(1, "d").toDate();
        }

        break;
      default:
        break;
    }
    return dataPoints;
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

  public static getDefaultDateRange(timeSpan: string) {
    switch(timeSpan) {
      case timeSpanConfigs.MONTH:
        return {
          startDate: moment().startOf("month").toDate(),
          endDate: moment().endOf("month").toDate(),
          dateFormat: "%e" // abbreviated weekday namespace-padded day of the month as a decimal number [ 1,31]
        }
      case timeSpanConfigs.DAY:
        return {
          startDate: moment().startOf("day").toDate(),
          endDate: moment().endOf("day").toDate(),
          dateFormat: "%I%p" // hour (12-hour clock) as a decimal number [01,12] followed by either AM or PM
        }
      case timeSpanConfigs.WEEK:
        return {
          startDate: moment().startOf("week").toDate(),
          endDate: moment().endOf("week").toDate(),
          dateFormat: "%a" // abbreviated weekday name
        }
      case timeSpanConfigs.HOUR:
        return {
          startDate: moment().startOf("hour").toDate(),
          endDate: moment().endOf("hour").toDate(),
          dateFormat: "%M" // minute as a decimal number [00,59]
        }
      case timeSpanConfigs.YEAR:
        return {
          startDate: moment().startOf("year").toDate(),
          endDate: moment().endOf("year").toDate(),
          dateFormat: "%b" // abbreviated month name
        }
      default:
        break;
    }
  }

  public static getDateRange(direction: string, dateRange: IDateRange): IDateRange {
    let startDate;
    let endDate;

    switch(dateRange.timeSpan) {
      case timeSpanConfigs.MONTH:
        startDate = moment(dateRange.startDate).add(direction === "prev" ? -1 : 1, "M");
        endDate = moment(dateRange.endDate).add(direction === "prev" ? -1 : 1, "M");

        break;
      case timeSpanConfigs.DAY:
        startDate = moment(dateRange.startDate).add(direction === "prev" ? -24 : 24, "h");
        endDate = moment(dateRange.endDate).add(direction === "prev" ? -24 : 24, "h");

        break;
      case timeSpanConfigs.WEEK:
        startDate = moment(dateRange.startDate).add(direction === "prev" ? -7 : 7, "d");
        endDate = moment(dateRange.endDate).add(direction === "prev" ? -7 : 7, "d");

        break;
      case timeSpanConfigs.HOUR:
        startDate = moment(dateRange.startDate).add(direction === "prev" ? -60 : 60, "m");
        endDate = moment(dateRange.endDate).add(direction === "prev" ? -60 : 60, "m");

        break;
      case timeSpanConfigs.YEAR:
        startDate = moment(dateRange.startDate).add(direction === "prev" ? -1 : 1, "y");
        endDate = moment(dateRange.endDate).add(direction === "prev" ? -1 : 1, "y");

        break;
      default:
        break;
    }

    return {
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      timeSpan: dateRange.timeSpan,
      dateFormat: dateRange.dateFormat
    }
  }

}
