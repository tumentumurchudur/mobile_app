import { Action } from '@ngrx/store';
import { IReads, IMeter, IReadSummaries } from '../../interfaces';

export const ADD_READS: string = "ADD READS";
export const LOAD_READS_FROM_DB: string = "LOAD READS FROM DB";
export const ADD_SUMMARIES: string = "ADD SUMMARIES";
export const LOAD_SUMMARIES_FROM_DB: string = "ADD SUMMARIES FROM DB";

export class AddReads implements Action {
	public readonly type = ADD_READS;
	public payload: IReads[] | null;

	constructor(private _payload: IReads[]) {
		this.payload = _payload;
	}
}

export class LoadReadsFromDb implements Action {
	public readonly type = LOAD_READS_FROM_DB;
	public payload: IMeter[] | null;

	constructor(private _payload: IMeter[]) {
		this.payload = _payload;
	}
}

export class AddSummaries implements Action {
	public readonly type = ADD_SUMMARIES;
	public payload: IReadSummaries | null;

	constructor(private _payload: IReadSummaries) {
		this.payload = _payload;
	}
}

export class LoadSummariesFromDb implements Action {
	public readonly type = LOAD_SUMMARIES_FROM_DB;
	public payload: string | null;

	constructor(private _payload: string) {
		this.payload = _payload;
	}
}
