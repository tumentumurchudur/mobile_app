import { ISeason } from "./season";

export interface IMeter {
  _name: string,
  _billing_start: number | null,
  _goal: number | null,
  _guid: string | null,
  _meter_id: string | null,
  _plan: string | null,
  _provider: string | null,
  _type: string,
  _ncmpAvgGuid: string,
  _ncmpEffGuid: string,
  _reads: any[],
  _usage: number,
  _utilityType: string,
  _tiers: Map<number, number>,
  _facilityFee: number,
  _summer: ISeason,
  _winter: ISeason
}
