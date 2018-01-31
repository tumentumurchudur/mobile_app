import { ActionReducerMap } from "@ngrx/store";
import * as ActionTypes from "../actions";

export interface UiControlsState {
  uiControls: {
    sideMenuOpen: boolean
  };
}

export const uiControlsReducerMap: ActionReducerMap<UiControlsState> = {
  uiControls: uiControlsReducer
};

export function uiControlsReducer(state = { sideMenuOpen: false }, action): any {
  switch (action.type) {
    case ActionTypes.SIDE_MENU_OPEN:
      return Object.assign({}, state, {sideMenuOpen: true});
    case ActionTypes.SIDE_MENU_CLOSE:
      return Object.assign({}, state, {sideMenuOpen: false});
    default:
      return state;
  }
}
