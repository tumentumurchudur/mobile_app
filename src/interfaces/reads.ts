import { IRead } from "./read";

export interface IReads {
  guid: string | null,
  startDate: Date | null,
  endDate: Date | null,
  reads: IRead[] | null
}
