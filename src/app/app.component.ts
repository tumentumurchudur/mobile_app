import { Component } from "@angular/core";
import { Platform } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Storage } from "@ionic/storage";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  rootPage:any = "LoginPage";

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, storage: Storage) {
    platform.ready().then(() => {
      // storage.get("userInfo").then((val) => {
      //   if (val) {
      //     this.rootPage = "HomePage"
      //   } else {
      //     this.rootPage = "LoginPage"
      //   }
      // })
      statusBar.overlaysWebView(false);
      statusBar.backgroundColorByHexString("#d5dde2");

      if (platform.is("android")) {
        statusBar.overlaysWebView(false);
        statusBar.backgroundColorByHexString("#d5dde2");
      }
      splashScreen.hide();
    });
  }
}

