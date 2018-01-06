import { Component } from "@angular/core";
import { Platform } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  rootPage:any = "LoginPage";

  constructor(platform: Platform, statusBar: StatusBar) {
    platform.ready().then(() => {
      statusBar.overlaysWebView(true);
      statusBar.backgroundColorByHexString("#d5dde2");

      if (platform.is("android")) {
        statusBar.overlaysWebView(false);
        statusBar.backgroundColorByHexString("#d5dde2");
      }
    });
  }
}

