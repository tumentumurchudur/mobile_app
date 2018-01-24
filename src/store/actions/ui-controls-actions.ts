import { Action } from "@ngrx/store";

export const SIDE_MENU_OPEN: string = "SIDE MENU OPEN";
export const SIDE_MENU_CLOSE: string = "SIDE MENU CLOSE";

export class SideMenuOpen implements Action {
  public readonly type = SIDE_MENU_OPEN;
  public payload: any = null;
}

export class SideMenuClose implements Action {
  public readonly type = SIDE_MENU_CLOSE;
  public payload: any = null;
}
