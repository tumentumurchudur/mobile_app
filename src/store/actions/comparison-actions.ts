import { Action } from "@ngrx/store";
import { IMeter, IComparison } from "../../interfaces";

export const TRIGGER_COMPARISON_READS: string = "[Comparison] TRIGGER COMPARISON READS";
export const ADD_COMPARISON_READS: string = "[Comparison] ADD COMPARISON READS";
export const LOADING_COMPARISON_READS: string = "[Comparison] LOADING COMPARISON READS";

export class TriggerComparisonReads implements Action {
	public readonly type = TRIGGER_COMPARISON_READS;
	public payload: any | null;

	constructor(private _payload: any) {
		this.payload = _payload;
	}
}

export class AddComparison implements Action {
	public readonly type = ADD_COMPARISON_READS;
	public payload: IComparison | null;

	constructor(private _payload: IComparison) {
		this.payload = _payload;
	}
}

export class LoadingComparisonReads implements Action {
	public readonly type = LOADING_COMPARISON_READS;
	public payload = null;
}
