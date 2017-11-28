import { Injectable } from "@angular/core";
import { IRead, ILineItem } from '../interfaces';

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
}
