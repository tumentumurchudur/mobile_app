import { Injectable } from "@angular/core";
import { IRead, ILineItem, IDateRange } from "../interfaces";
import { timeSpanConfigs } from "../configs";
import * as moment from "moment";

export class ChartHelper {
  public static getDeltas(data: IRead[]): ILineItem[] {
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

  public static normalizeReads(dateRange: IDateRange, data: ILineItem[]): ILineItem[] {
    let { startDate, endDate, timeSpan } = dateRange;
    const dataPoints = [];
    const emptyPoints = [];

    switch(timeSpan) {
      case timeSpanConfigs.MONTH:
      case timeSpanConfigs.WEEK:
        while(startDate < endDate) {
          const startDay = moment(startDate).startOf("day").toDate();
          const endDay = moment(startDate).endOf("day").toDate();
          const dataPoint: ILineItem = this._getTotalsByDateRange(startDay, endDay, data);

          // Check if data point is empty
          if (dataPoint.line1 <= 0) {
            // Tracks the index of empty days.
            // So [5, 8, 9] => means values at index 5, 8, and 9 are zero.
            emptyPoints.push(dataPoints.length);
          }
          dataPoints.push(dataPoint);

          startDate = moment(startDate).add(1, "d").toDate();
        }

        // Iterate over array that tracked empty data points and fill in missing values.
        this._fillEmptyHoles(dataPoints, emptyPoints);
        break;
      case timeSpanConfigs.DAY:
        while(startDate < endDate) {
          const startHour = startDate;
          const endHour = moment(startDate).add(1, "h").toDate();
          const dataPoint = this._getTotalsByDateRange(startHour, endHour, data);

          if (dataPoint.line1 <= 0) {
            emptyPoints.push(dataPoints.length);
          }
          dataPoints.push(dataPoint);

          startDate = moment(startDate).add(1, "h").toDate();
        }
        this._fillEmptyHoles(dataPoints, emptyPoints);
        break;
      case timeSpanConfigs.YEAR:
        while(startDate < endDate) {
          const startMonth = moment(startDate).startOf("month").toDate();
          const endMonth = moment(startDate).endOf("month").toDate();
          const dataPoint = this._getTotalsByDateRange(startMonth, endMonth, data);

          if (dataPoint.line1 <= 0) {
            emptyPoints.push(dataPoints.length);
          }
          dataPoints.push(dataPoint);

          startDate = moment(startDate).add(1, "M").toDate();
        }
        this._fillEmptyHoles(dataPoints, emptyPoints);
        break;
      case timeSpanConfigs.HOUR:
        while(startDate < endDate) {
          const startHour = startDate;
          const endHour = moment(startDate).add(15, "m").toDate();
          const dataPoint = this._getTotalsByDateRange(startHour, endHour, data);

          if (dataPoint.line1 <= 0) {
            emptyPoints.push(dataPoints.length);
          }
          dataPoints.push(dataPoint);

          startDate = moment(startDate).add(15, "m").toDate();
        }
        this._fillEmptyHoles(dataPoints, emptyPoints);
        break;
      default:
        break;
    }
    return dataPoints;
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

  private static _getTotalsByDateRange(startDate: Date, endDate: Date, data: ILineItem[]): ILineItem {
    const points = data.filter(d => d.date >= startDate && d.date < endDate);
    const total = points.reduce((a, b) => { return a + b.line1 }, 0);

    return {
      date: startDate,
      line1: total
    };
  }

  private static _fillEmptyHoles(data: ILineItem[], indices: number[]) {
    indices.forEach(emptyIndex => {
      // Moves back to find the first non-zero value in data array.
      let backIndex = emptyIndex > 0 ? emptyIndex - 1 : 0;

      // Moves forward to find the first non-zero value in data array.
      let frwdIndex = emptyIndex < data.length - 1 ? emptyIndex + 1 : data.length - 1;

      // Non-zero value comes before the zero value at index emptyIndex.
      let prevVal = 0;

      // Non-zero value comes after the zero value at index emptyIndex.
      let nextVal = 0;

      // if zero value is at index 0 or 1
      if (backIndex === 0) {
        prevVal = data[0].line1 || 0;
      }

      // if zero value is at last index
      if (frwdIndex >= data.length) {
        nextVal = 0;
      }

      // Moves both forward and backward directions at the same time
      // until first non-zero values are found.
      while (backIndex > 0 || frwdIndex < data.length) {

        if (backIndex > 0) {
          // First non-zero value is found before emptyIndex.
          if (data[backIndex].line1 > 0) {
            prevVal = data[backIndex].line1;
            backIndex = 0;
          } else {
            backIndex--;
          }
        }

        if (frwdIndex < data.length) {
          // First non-zero value is found after emptyIndex.
          if (data[frwdIndex].line1 > 0) {
            nextVal = data[frwdIndex].line1;
            frwdIndex = data.length;
          } else {
            frwdIndex++;
          }
        }

      }

      if (prevVal && nextVal) {
        data[emptyIndex].line1 = (prevVal + nextVal) / 2;
      } else if (prevVal && !nextVal) {
        data[emptyIndex].line1 = prevVal;
      } else if (!prevVal && nextVal) {
        data[emptyIndex].line1 = nextVal;
      }
    })
  }

}
