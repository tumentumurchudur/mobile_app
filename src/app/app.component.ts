import { Component } from "@angular/core";
import { Platform } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { Keyboard } from "@ionic-native/keyboard";
import { StoreServices } from "../store/services/store-services";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  rootPage:any = "LoginPage";

  constructor(platform: Platform,
              statusBar: StatusBar,
              keyboard: Keyboard,
              private _storeServices: StoreServices
  ) {
    platform.ready().then(() => {
      statusBar.overlaysWebView(false);
      statusBar.styleDefault();
      statusBar.backgroundColorByHexString("#EDEFF2");
      keyboard.disableScroll(true);
      if (platform.is("android")) {
        statusBar.overlaysWebView(false);
        statusBar.styleDefault();
      }
    });
  }

  private _closeMenu(){
    this._storeServices.sideMenuClose();
  }

  private _openMenu(){
    this._storeServices.sideMenuOpen();
  }


}

