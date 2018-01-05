import { Action } from "@ngrx/store";
import { IReads, IMeter, IUser } from "../../interfaces";

export const ADD_READS: string = "[Reads] ADD READS";
export const LOAD_READS_BY_METERS: string = "[Reads] LOAD READS BY METERS";
export const LOAD_READS_BY_DATE: string = "[Reads] LOAD READS BY DATE";
export const LOADING_READS: string = "[Reads] LOADING READS";
export const TRIGGER_LOAD_READS_BY_DATE_RANGE: string = "[Reads] TRIGGER LOAD READS BY DATE RANGE";

export class AddReads implements Action {
	public readonly type = ADD_READS;
	public payload: IReads | null;

	constructor(private _payload: IReads) {
		this.payload = _payload;
	}
}

export class LoadReadsByDateRange implements Action {
	public readonly type = LOAD_READS_BY_DATE;
	public payload: any | null;

	constructor(private _payload: any) {
		this.payload = _payload;
	}
}

export class LoadingReads implements Action {
	public readonly type = LOADING_READS;
	public payload = null;
}

export class TriggerLoadReadsByDateRange implements Action {
	public readonly type = TRIGGER_LOAD_READS_BY_DATE_RANGE;
	public payload: { meter, timeSpan, startDate, endDate };

	constructor(private _payload: { meter, timeSpan, startDate, endDate }) {
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
