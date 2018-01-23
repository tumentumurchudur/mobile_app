import { Action } from "@ngrx/store";

export const SIDE_MENU_OPEN: string = "SIDE MENU OPEN";

export class SideMenuOpen implements Action {
  public readonly type = SIDE_MENU_OPEN;
  public payload: boolean | null;

  constructor(private _payload: boolean) {
    this.payload = _payload;
  }
}
