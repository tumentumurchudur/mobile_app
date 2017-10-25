import { Action } from '@ngrx/store';
import { User } from '../../interfaces';

export const LOGGED_IN: string = 'LOGGED_IN';
export const LOGGED_OUT: string = 'LOGGED_OUT';

export class UserLoggedIn implements Action {
    public type = LOGGED_IN;
    public payload: User | null;

    constructor(private _payload: User) {
        this.payload = _payload;
    }
}

export type UserActions = UserLoggedIn;
