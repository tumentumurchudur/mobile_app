import { Component } from "@angular/core";
import { StoreServices } from "../../store/services/store-services";
import { App } from "ionic-angular";
import { ISideMenuItem } from "../../interfaces/index";

@Component({
  selector: "menu-items",
  templateUrl: "menu-items.html"
})
export class MenuItemsComponent {
  _menuItems: Array<ISideMenuItem>;

  constructor(
    private _storeServices: StoreServices,
    private _app: App
  ) {
    this._menuItems = [
      { title: "Add A Meter", component: "AddMeterPage", icon: "md-add" },
      { title: "Log Out", component: "LoginPage", icon: "log-out" }
    ];
  }

  private _closeMenu() {
    this._storeServices.sideMenuClose();
  }

  private _openMenu() {
    this._storeServices.sideMenuOpen();
  }

  private _openPage(menuItems: ISideMenuItem) {
    this._closeMenu();
    const navigate = this._app.getActiveNavs()[0];

    if (menuItems.title === "Log Out") {
      this._storeServices.logOutUser();
      navigate.setRoot("LoginPage");
      return;
    }
    navigate.push("AddMeterPage");
  }

}
