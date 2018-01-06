import { Component } from "@angular/core";
import { Platform } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { Keyboard } from "@ionic-native/keyboard";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  rootPage:any = "LoginPage";

  constructor(platform: Platform, statusBar: StatusBar, keyboard: Keyboard) {
    platform.ready().then(() => {
      statusBar.overlaysWebView(false);
      statusBar.styleDefault();
      keyboard.disableScroll(true);
      if (platform.is("android")) {
        statusBar.overlaysWebView(false);
        statusBar.backgroundColorByHexString("#d5dde2");
        keyboard.disableScroll(true);
      }
    });
  }
}

