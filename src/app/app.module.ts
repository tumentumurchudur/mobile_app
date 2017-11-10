import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

import { AngularFireModule } from "angularfire2";
import { AngularFireAuthModule } from "angularfire2/auth"
import { fireBaseConfig } from "../configs";
import { AuthProvider, DatabaseProvider } from "../providers"
import { Facebook } from "@ionic-native/facebook";
import { GooglePlus } from "@ionic-native/google-plus";

import { StoreModule } from "@ngrx/store";
import { reducers } from "../store/reducers";
import { EffectsModule } from "@ngrx/effects";
import { MainEffects } from "../store/effects";
import { StoreServices } from "../store/services";
import { CostHelper } from "../helpers";

import { MyApp } from "./app.component";

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([MainEffects]),
    AngularFireModule.initializeApp(fireBaseConfig),
    AngularFireAuthModule,
    BrowserAnimationsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    Facebook,
    GooglePlus,
    DatabaseProvider,
    StoreServices,
    CostHelper
  ]
})
export class AppModule {}
