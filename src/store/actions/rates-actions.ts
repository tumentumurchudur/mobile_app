import { Action } from '@ngrx/store';
import { IRates } from '../../interfaces';

export const ADD_RATES: string = "ADD RATES";

export class AddRates implements Action {
	public readonly type = ADD_RATES;
	public payload: IRates[] | null;

	constructor(private _payload: IRates[]) {
		this.payload = _payload;
	}
}
