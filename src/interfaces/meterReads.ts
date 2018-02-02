import { IReads } from "./reads";

export interface IMeterReads {
  data: IReads[] | null;
  guid: string | null;
}
