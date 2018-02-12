import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { Keyboard } from "@ionic-native/keyboard";
import { SQLite } from "@ionic-native/sqlite";

import { AngularFireModule } from "angularfire2";
import { HttpClientModule } from "@angular/common/http";
import { AngularFireAuthModule } from "angularfire2/auth";
import { fireBaseConfig } from "../configs";
import { AuthProvider, DatabaseProvider } from "../providers";
import { Facebook } from "@ionic-native/facebook";
import { GooglePlus } from "@ionic-native/google-plus";

import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { StoreModule } from "@ngrx/store";
import { reducers, metaReducers } from "../store/reducers";
import { EffectsModule } from "@ngrx/effects";
import { IonicStorageModule } from "@ionic/storage";
import { MeterEffects, ComparisonEffects, ReadsEffects, ProviderEffects, UserEffects } from "../store/effects";
import { StoreServices } from "../store/services";
import { CostHelper } from "../helpers";
import { SQLiteMock } from "../providers";

import { MyApp } from "./app.component";
import { MenuItemsComponent } from "../components/menu-items/menu-items";

@NgModule({
  declarations: [
    MyApp,
    MenuItemsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp,
      {
        platforms: {
          ios : {
            scrollAssist: false,
            autoFocusAssist: false,
            statusbarPadding: true
          },
          android : {
            scrollAssist: false,
            autoFocusAssist: false
          }
        }
      }),
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      maxAge: 25 //  Retains last 25 states
    }),
    EffectsModule.forRoot([MeterEffects, ComparisonEffects, ReadsEffects, ProviderEffects, UserEffects]),
    IonicStorageModule.forRoot({
      name: "__vudb",
         driverOrder: ["sqlite", "websql", "indexeddb"]
    }),
    AngularFireModule.initializeApp(fireBaseConfig),
    AngularFireAuthModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    MenuItemsComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Keyboard,
    AuthProvider,
    Facebook,
    GooglePlus,
    DatabaseProvider,
    StoreServices,
    CostHelper,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: SQLite, useClass: SQLiteMock }
  ]
})
export class AppModule {}
