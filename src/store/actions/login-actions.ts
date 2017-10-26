import { Action } from '@ngrx/store';
import { IUser } from '../../interfaces';

export const LOGGED_IN: string = 'LOGGED_IN';
export const LOGGED_OUT: string = 'LOGGED_OUT';

export class UserLoggedIn implements Action {
    public readonly type = LOGGED_IN;
    public payload: IUser | null;

    constructor(private _payload: IUser) {
        this.payload = _payload;
    }
}

export type UserActions = UserLoggedIn;
