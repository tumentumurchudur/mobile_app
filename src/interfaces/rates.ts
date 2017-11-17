import { ITier } from "./tier";

export interface IRates {
  _guid: string | null,
  _winter: ITier | null,
  _summer: ITier | null,
  _facilityFee: number | null
}
