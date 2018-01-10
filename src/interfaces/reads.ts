import { IRead } from "./read";
import { ILineItem } from "./line-item";

export interface IReads {
  guid: string | null,
  startDate: Date | null,
  endDate: Date | null,
  reads: IRead[] | null,
  deltas: ILineItem[] | null,
  cost: { totalCost: number, totalDelta: number } | null
  timedOut: boolean
}
