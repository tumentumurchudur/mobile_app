import { Component } from '@angular/core';
import { StoreServices } from "../../store/services/store-services";
import { App } from "ionic-angular";

@Component({
  selector: 'menu-items',
  templateUrl: 'menu-items.html'
})
export class MenuItemsComponent {
  _menuItem: Array<{title: string, component: string, icon: string}>;

  constructor(
    private _storeServices: StoreServices,
    private _app: App
  ) {
    this._menuItem = [
      { title: 'Add A Meter', component: "AddMeterPage", icon: "md-add" },
      { title: 'Log Out', component: "LoginPage", icon: "log-out" }
    ];
  }

  private _closeMenu(){
    this._storeServices.sideMenuOpen(false);
  }

  private _openMenu(){
    this._storeServices.sideMenuOpen(true);
  }

  private _openPage(menuItem) {
    this._closeMenu();
    const navigate = this._app.getActiveNavs()[0];

    if (menuItem.title === "Log Out") {
      this._storeServices.logOutUser();
      navigate.setRoot("LoginPage");
      return;
    }
    navigate.push("AddMeterPage");
  }

}
