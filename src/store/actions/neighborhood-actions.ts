import { Action } from "@ngrx/store";
import { IMeter } from "../../interfaces";

export const TRIGGER_NEIGHBORHOOD_READS: string = "[Neighborhood] TRIGGER READS";

export class TriggerNeighborhoodReads implements Action {
	public readonly type = TRIGGER_NEIGHBORHOOD_READS;
	public payload: IMeter | null;

	constructor(private _payload: IMeter) {
		this.payload = _payload;
	}
}
