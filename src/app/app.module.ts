import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";

import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { Keyboard } from "@ionic-native/keyboard";

import { AngularFireModule } from "angularfire2";
import { AngularFireAuthModule } from "angularfire2/auth"
import { fireBaseConfig } from "../configs";
import { AuthProvider, DatabaseProvider } from "../providers"
import { Facebook } from "@ionic-native/facebook";
import { GooglePlus } from "@ionic-native/google-plus";

import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { StoreModule } from "@ngrx/store";
import { reducers, metaReducers } from '../store/reducers';
import { EffectsModule } from '@ngrx/effects';
import { IonicStorageModule } from '@ionic/storage'
import { MainEffects } from '../store/effects';
import { StoreServices } from "../store/services";
import { CostHelper } from "../helpers";

import { MyApp } from "./app.component";

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp,
      {
        autoFocusAssist: false,
        scrollAssist: false
      }),
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      maxAge: 25 //  Retains last 25 states
    }),
    EffectsModule.forRoot([MainEffects]),
    IonicStorageModule.forRoot(),
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
    Keyboard,
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
