import { IUsage } from "./usage";
import { ILineItem } from "./line-item";

export interface IComparison {
  guid: string;
  startDate: Date;
  endDate: Date;
  avgCosts: IUsage | null;
  effCosts: IUsage | null;
  usageCosts: IUsage | null;
  calcReads: ILineItem[];
  rank: number,
  timedOut: boolean
}
