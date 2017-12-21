import { IUsage } from "./usage";

export interface IComparison {
  guid: string;
  startDate: Date;
  endDate: Date;
  group: any;
  avg: any[];
  avgCosts: IUsage;
  eff: any[];
  effCosts: IUsage;
  usage: any[];
  usageCosts: IUsage;
  calcReads: any[];
}
