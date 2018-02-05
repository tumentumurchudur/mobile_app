import { Action } from "@ngrx/store";
import { IReads, IMeter, IUser } from "../../interfaces";
import { IDateRange } from "../../interfaces/date-range";

export const ADD_READS: string = "[Reads] ADD READS";
export const LOAD_READS_BY_METERS: string = "[Reads] LOAD READS BY METERS";
export const LOAD_READS_BY_DATE: string = "[Reads] LOAD READS BY DATE";
export const LOADING_READS: string = "[Reads] LOADING READS";
export const SAVE_READS: string = "[Reads] SAVE READS";
export const RESET_READS_TIMEOUT: string = "[Reads] RESET READS TIMEOUT";

export class AddReads implements Action {
	public readonly type = ADD_READS;
	public payload: IReads | null;

	constructor(private _payload: IReads) {
		this.payload = _payload;
	}
}

export class LoadReadsByDateRange implements Action {
	public readonly type = LOAD_READS_BY_DATE;
	public payload: { meter: IMeter, dateRange: IDateRange };

	constructor(private _payload: { meter: IMeter, dateRange: IDateRange }) {
		this.payload = _payload;
	}
}

export class LoadingReads implements Action {
	public readonly type = LOADING_READS;
	public payload = null;
}

export class SaveReads implements Action {
  public readonly type = SAVE_READS;
  public payload: { read: IReads, dateRange: IDateRange };

  constructor(private _payload: { read: IReads, dateRange: IDateRange }) {
    this.payload = _payload;
  }
}

export class LoadReadsByMeters implements Action {
	public readonly type = LOAD_READS_BY_METERS;
	public payload: { meters: IMeter[], user: IUser };

	constructor(private _payload: { meters: IMeter[], user: IUser }) {
		this.payload = _payload;
	}
}

export class ResetReadsTimeout implements Action {
	public readonly type = RESET_READS_TIMEOUT;
	public payload: { guid: string, dateRange: IDateRange };

	constructor(private _payload: { guid: string, dateRange: IDateRange }) {
		this.payload = _payload;
	}
}
