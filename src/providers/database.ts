import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import firebase from "firebase";

import { fireBaseConfig, neighborhoodConfigs, databasePaths, databaseToken } from "../configs";
import { IUser, IMeter, IReads, IDateRange } from "../interfaces";
import { AuthProvider } from "./auth";

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/operator/catch";

@Injectable()
export class DatabaseProvider {
  private _db: firebase.database.Database;
  private _usersRef: firebase.database.Reference;
  private _metersRef: firebase.database.Reference;
  private _orgsRef: firebase.database.Reference;
  private _readsRef: firebase.database.Reference;
  private _providersRef: firebase.database.Reference;
  private _ncmpRanksRef: firebase.database.Reference;

  constructor(
    private _authProvider: AuthProvider,
    private _httpClient: HttpClient
  ) {
    if (!firebase.apps.length) {
        firebase.initializeApp(fireBaseConfig);
    }

    this._db = firebase.database();

    this._usersRef = this._db.ref(databasePaths.users);
    this._metersRef = this._db.ref(databasePaths.meters);
    this._orgsRef = this._db.ref(databasePaths.orgs);
    this._readsRef = this._db.ref(databasePaths.reads);
    this._providersRef = this._db.ref(databasePaths.providers);
    this._ncmpRanksRef = this._db.ref(databasePaths.ranks);
  }

  /**
   * Gets org path string from uid.
   *
   * @param {string} uid
   * @returns {Observable<string>}
   * @memberof DatabaseProvider
   */
  public getOrgPathForUser(uid: string): Observable<string> {
    return Observable.create(observer => {
      return this._usersRef.child(uid).once("value").then(snapshot => {
        const { orgs = null } = snapshot.val();

        if (orgs && !Array.isArray(orgs)) {
          observer.next(orgs.path);
        } else {
          observer.next(orgs[0].path);
        }
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }

  /**
   * Gets all meters associated with the given org path and
   * returns the meters as an array.
   *
   * @param {string} orgPath
   * @returns {Observable<IMeter[]>}
   * @memberof DatabaseProvider
   */
  public getMetersForOrg(orgPath: string): Observable<IMeter[]> {
    return Observable.create(observer => {
      return this._orgsRef.child(orgPath).once("value").then(snapshot => {
        let meters: IMeter[] = [];

        snapshot.forEach(child => {
          const building = child.val();
          const metersInBuilding = building._meters;

          if (building && metersInBuilding) {
            const { _gas = null, _power = null, _solar = null, _water = null } = metersInBuilding;

            const gasMeters = _gas ? this._getMeters(_gas, "gas") : [];
            const powerMeters = _power ? this._getMeters(_power, "power") : [];
            const solarMeters = _solar ? this._getMeters(_solar, "solar") : [];
            const waterMeters = _water ? this._getMeters(_water, "water") : [];

            // Flattens meters arrays into a single array.
            meters = [].concat(gasMeters, powerMeters, solarMeters, waterMeters);
          }
        });

        observer.next(meters);
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }

  /**
   * Gets reads data for each meter in the meters array and
   * adds _reads property that have the reads data.
   *
   * Example: meters: [{ _name, _billingStart, ... }, {...}]
   * returns meters: [{ _name, _billingStart, _reads: [...] }, {..., _reads: [...]}]
   *
   * @param {IMeter[]} meters
   * @returns {Observable<IMeter[]>}
   * @memberof DatabaseProvider
   */
  public getReadsForMeters(meters: IMeter[]): Observable<IMeter[]> {
    return Observable
      .combineLatest(
        // sends request for reads for each meter using meter guid.
        ...meters.map(meter => this.getReadsForMeter(meter._guid, meter._billing_start))
      )
      .map((allMeterData: IMeter[][]) => {
        // Adds property _reads and assigns the reads for each meter in the passed meters array.
        return meters.map((meter, index) => {
          return { ...meter, _reads: allMeterData[index] }
        });
      });
  }

  /**
   * Gets provider data for each meter in the meters array.
   * Adds data for _summer, _facilityFee and _winter as properties.
   *
   * @param {IMeter[]} meters
   * @returns {Observable<IMeter[]>}
   * @memberof DatabaseProvider
   */
  public getProviderForMeters(meters: IMeter[]): Observable<IMeter[]> {
    return Observable
      .combineLatest(
        ...meters.map(meter => this._getProviderForMeter(meter._provider))
      )
      .map(providers => {
        const planTypes = ["Residential", "City", "County"];

        return providers.map((provider, index) => {
          const { plans = null } = provider;
          let rateInfo = null;

          for(const type of planTypes) {
            if (plans[type]) {
              rateInfo = plans[type];
              break;
            }
          }

          const facilityFee = rateInfo ? rateInfo.facility_fee : null;
          const rateSchedules = rateInfo ? rateInfo.rate_schedules : null;
          const summer = rateSchedules ? rateSchedules.summer : null;
          const winter = rateSchedules ? rateSchedules.winter : null;

          return {
            ...meters[index],
            _summer: summer, _winter: winter, _facilityFee: facilityFee
          }
        });
      });
  }

  /**
   * Gets provider data for the given provider path.
   *
   * @private
   * @param {string} providerPath
   * @returns {Observable<any>}
   * @memberof DatabaseProvider
   */
  private _getProviderForMeter(providerPath: string): Observable<any> {
    return Observable.create(observer => {
      return this._providersRef.child(providerPath).once("value").then(snapshot => {
        const providerData = snapshot.val();

        observer.next(providerData);
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }

  /**
   * Gets all reads for the given meter using meter guid and billing start date.
   *
   * @private
   * @param {string} meterGuid
   * @param {number} billingStart
   * @returns {Observable<IMeter[]>}
   * @memberof DatabaseProvider
   */
  public getReadsForMeter(meterGuid: string, billingStart: number): Observable<IMeter[]> {
    const today = new Date();
    const refDate = new Date(today.getFullYear(), today.getMonth(), billingStart);
    const prevBillingStartDate = new Date(today.getFullYear(), today.getMonth() - 1, billingStart);
    const billingStartDate = refDate < today ? refDate : prevBillingStartDate;

    const startAt = billingStartDate.getTime().toString();
    const endAt = today.getTime().toString();

    return Observable.create(observer => {
      return this._readsRef
        .child(meterGuid)
        .child("reads")
        .orderByKey()
        .startAt(startAt)
        .endAt(endAt)
        .once("value")
        .then(snapshot => {
          const data = snapshot.val();
          let reads = [];

          if (data) {
            reads = Object.keys(data).map(key => {
              return { date: key, total: data[key].total };
            });
          }

          observer.next(reads);
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  public getSummaries(meterGuid: string, timeSpan: string) {
    return Observable.create(observer => {
      return this._readsRef
      .child(meterGuid)
      .child(`read_summaries/${timeSpan}`)
      .orderByKey()
      .once("value")
      .then(snapshot => {
        const data = snapshot.val();
        let reads = [];

        if (data) {
          reads = Object.keys(data).map(key => {
            return {
              date: new Date(data[key].lastReadTime),
              line1: data[key].delta
            };
          });
        }
        observer.next(reads);
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }

  public getReadsByDateRange(meterGuid: string, dateRange: IDateRange): Observable<IReads[]> {
    const { startDate, endDate } = dateRange;
    const startAt = startDate.getTime().toString();
    const endAt = endDate.getTime().toString();

    return Observable.create(observer => {
      return this._readsRef
        .child(meterGuid)
        .child("reads")
        .orderByKey()
        .startAt(startAt)
        .endAt(endAt)
        .once("value")
        .then(snapshot => {
          const data = snapshot.val();
          let reads = [];

          if (data) {
            reads = Object.keys(data).map(key => {
              return { date: key, total: data[key].total };
            });
          }

          observer.next(reads);
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  public getReadsByNeighborhood(guid: string, dateRange: IDateRange): Observable<IReads[]> {
    const { startDate, endDate } = dateRange;
    const startAt = startDate.getTime().toString();
    const endAt = endDate.getTime().toString();

    return Observable.create(observer => {
      return this._readsRef
        .child(guid)
        .child("read_summaries/hours")
        .orderByKey()
        .startAt(startAt)
        .endAt(endAt)
        .once("value")
        .then(snapshot => {
          const data = snapshot.val();
          let reads = [];

          if (data) {
            reads = Object.keys(data).map(key => {
              return { date: key, delta: data[key].delta };
            });
          }
          observer.next(reads);
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  public addMeter(meter: IMeter, user: IUser): Observable<IMeter> {

    return Observable.create(observer => {
      const updates = {};
      const path = `${user.orgPath}/Building1/_meters/_${meter._utilityType}/${meter._name}`;
      const settings = {
        _billing_start: meter._billing_start,
        _goal: meter._goal,
        _meter_id: meter._meter_id,
        _plan: meter._plan,
        _provider: meter._provider,
        _type: meter._type,
        _guid: meter._guid,
      };

      updates[path] = settings;

      this._orgsRef.child(path).set(settings).then(() => {
        observer.next(Object.assign({}, meter, settings));
      }, error => {
        observer.error(error);
      });
    });
  }

  public updateMeterSettings(meter: IMeter, user: IUser): Observable<IMeter> {
    return Observable.create(observer => {
      const updates = {};
      const path = `${user.orgPath}/Building1/_meters/_${meter._utilityType}/${meter._name}`;
      const settings = {
        _billing_start: meter._billing_start,
        _goal: meter._goal,
        _guid: meter._guid,
        _meter_id: meter._meter_id,
        _provider: meter._provider,
        _plan: meter._plan,
        _type: meter._type
      };

      updates[path] = settings;

      this._orgsRef.update(updates).then(() => {
        observer.next(Object.assign({}, meter, settings));
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }

  public findMeterById(meterId: string): Observable<any> {
    return Observable.create(observer => {
      this._metersRef.orderByChild("meter_id").equalTo(meterId).once("value").then((snapshot) => {
        const meterGuidObj = snapshot.val();

        if (meterGuidObj) {
          const meterGuid = Object.keys(meterGuidObj)[0];
          observer.next(meterGuid);
        } else {
          observer.next(null);
        }
      }, error => {
        observer.error(error);
      });
    });
  }

  private _getShallowList(httpService: HttpClient, path: string): Observable<any> {
    return httpService.get(`${path}.json?auth=${databaseToken.production}&shallow=true`)
      .map(res => Object.keys(res));
  }

  public getProviderTypes(): Observable<any> {
      return this._getShallowList(this._httpClient, `${this._providersRef}`);
  }

  public getProviderRequestInfo(path: string): Observable<any> {
    return this._getShallowList(this._httpClient, `${this._providersRef}/${path}`);
  }

  public getNeighborhoodGroup(meter: IMeter): Observable<any> {
    const { _guid, _utilityType } = meter;

    return Observable.combineLatest(
      this._authProvider.getTokenId(),
    ).switchMap((data: any) => {
      const [token] = data;
      const header = new HttpHeaders().set("Authorization", neighborhoodConfigs.AUTHORIZATION);

      return this._httpClient
        .get(`${neighborhoodConfigs.NEIGHBORHOOD_COMP_DEV_REST_URL}?guid=${_guid}&token=${token}&utilityType=${_utilityType}`, { headers: header })
        .catch(error => {
          return Observable.of(null);
        });
    });
  }

  public getNeighborhoodComparisonRanks(meter: IMeter, dateRange: IDateRange): Observable<number> {
    const { startDate, endDate } = dateRange;
    const startAt = startDate.getTime().toString();
    const endAt = endDate.getTime().toString();

    return Observable.create(observer => {
      this._ncmpRanksRef
        .child(`${meter._guid}/hours`)
        .orderByKey()
        .startAt(startAt)
        .endAt(endAt)
        .once("value")
        .then(snapshot => {
          const ranks = snapshot.val();
          const totals = [];
          let sum = 0;

          if (ranks) {
            Object.keys(ranks).forEach(key => {
              totals.push(ranks[key]);
            });

            sum = totals.reduce((a, b) => { return a + b.total }, 0);
          }

          observer.next(sum > 0 ? Math.round(sum / totals.length) : 0);
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  public deleteMeter(meter: IMeter, user: IUser): Observable<IMeter> {
    return Observable.create(observer => {
      const path = `${user.orgPath}/Building1/_meters/_${meter._utilityType}/${meter._name}`;

      this._orgsRef.child(path).remove().then(() => {
        observer.next(meter);
      })
      .catch(error => {
        observer.error(error);
      });
    });
  }

  /**
   * Iterates over meterObject containing meters and
   * puts the meters into an array and returns the array.
   *
   * Example: { MeterY: IMeter, MeterZ: IMeter, ... }
   *
   * @private
   * @param {*} meterObject
   * @param {string} meterType
   * @returns {IMeter[]}
   * @memberof DatabaseProvider
   */
  private _getMeters(meterObject: any, meterType: string): IMeter[] {
    return Object.keys(meterObject).map(key => {
      return Object.assign({}, meterObject[key], { _name: key, _utilityType: meterType });
    });
  }
}
