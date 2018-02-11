import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";

import { IonicPage, MenuController } from "ionic-angular";
import { IUser } from "../../interfaces";
import { Store } from "@ngrx/store";
import { AppState } from "../../store/reducers";
import { StoreServices } from "../../store/services/store-services";

@IonicPage({
  name: "HomePage"
})
@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage implements OnInit, OnDestroy {
  private _user: IUser;
  private _subscriptions: Subscription[] = [];
  private _selectSideMenuStatus$: Observable<any>;
  private _db: SQLiteObject;
  private _currentLocale: string = "en_us";

  ngOnInit() {
    const subscription: Subscription = this._store.select(state => state.user)
      .subscribe((user: IUser) => {
        this._user = user;
      });

    this._subscriptions.push(subscription);

    // Checks for reads in local storage for the lineChart to consume
    this._checkForLineReads();

    // Check sql table and create one if not created.
    this._createDatabase();
  }

  ionViewWillEnter() {
    this._menuCtrl.swipeEnable(true);
  }

  ionViewWillLeave() {
    this._menuCtrl.swipeEnable(false);
  }

  ngOnDestroy() {
    for (const subscription of this._subscriptions) {
      subscription.unsubscribe();
    }
  }

  private _createDatabase() {
    this._sqlite.create({
      name: "vutiliti_db.db",
      location: "default"
    })
    .then((db: SQLiteObject) => {
      this._db = db;

      return db.executeSql("CREATE TABLE IF NOT EXISTS localization(id INTEGER PRIMARY KEY, platform INTEGER, key TEXT, en_us TEXT, es_mx TEXT)", {});
    })
    .then(() => {
      // TODO: Call api for localization data.
      return this._db.executeSql("INSERT INTO Localization(id, platform, key, en_us, es_mx) VALUES(1, 1, 'text_1', 'Hello', 'Hola')", []);
    })
    .then(() => {
      return this._db.executeSql("SELECT * FROM Localization", []);
    })
    .then(data => {
      // map of key and translation text.
      const localeMap = new Map<string, string>();

      if (data.rows.length) {
        for (let i = 0 ; i < data.rows.length ; i++) {
          const text = data.rows.item(i)[this._currentLocale];
          const key = data.rows.item(i).key;
          
          // TODO: Move it to store.
          localeMap.set(key, text);
        }
      }
    })
    .catch(error => {
      // TODO: Handle errors.
    });
  }

  private _checkForLineReads() {
    this._storage.get("readsData").then((lineReads) => {
      if (!lineReads) {
        return;
      }

      lineReads.forEach((read) => {
        read.startDate = new Date(read.startDate);
        read.endDate = new Date(read.endDate);

        read.deltas.forEach(delta => {
          delta.date = new Date(delta.date);
        });
      });

      this._storeServices.addReads(lineReads);
    });
  }

  constructor(
    private _store: Store<AppState>,
    private _menuCtrl: MenuController,
    private _storeServices: StoreServices,
    private _storage: Storage,
    private _sqlite: SQLite
  ) {
    this._selectSideMenuStatus$ = this._storeServices.selectSideMenuStatus();
  }

  private _openSideMenu(): void {
    this._storeServices.sideMenuOpen();
    this._menuCtrl.open();
  }

}
