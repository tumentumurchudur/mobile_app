import { Action, MetaReducer, ActionReducer } from "@ngrx/store";
import { IStoreSession } from "../interfaces";

/**
 * Wraps any reducer whose state implements IStoreSession
 *
 * @param {ActionReducer<T extends IStoreSession>} reducer
 * @returns
 */
export function saveState<T extends IStoreSession>(reducer: ActionReducer<T>) {
     return function (state: T, action: Action): T {
        const newState = reducer(state, action);

        if (newState.sessionStorageKey) {

        }

        return newState;
     };
}
