import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/reducers';

import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/combineLatest';

import { Subscription } from 'rxjs/Subscription';
import { IUser, IMeter } from '../../../interfaces';
import { DatabaseProvider } from '../../../providers';

@Component({
  selector: 'utility-spending',
  templateUrl: 'utility-spending.html'
})
export class UtilitySpendingComponent implements OnDestroy, OnInit {
  @Input() user: IUser | null = null;

  private _users: IUser[] = [];
  private _subscriptions: Subscription[] = [];
  private _meters: IMeter[] = [];

  constructor(
    private _store: Store<AppState>,
    private _db: DatabaseProvider
  ) { }

  ngOnInit() {
    this._subscriptions.push(this._subscribeToUserDataChange());

    this._db.getOrgPathForUser(this.user.uid)
    .switchMap((path: string) => {
      return this._db.getMetersForOrg(path);
    })
    .switchMap((meters: IMeter[]) => {
      this._meters = meters;

      return Observable.combineLatest(
        ...this._meters.map(meter => this._db.getReadsForMeter(meter._guid))
      );
    })
    .subscribe((reads: any[]) => {
      this._meters.forEach((meter, index) => {
        meter._reads = reads[index];
      });

      // TODO: dispatch an action to populate the store.
    });
  }

  ngOnDestroy() {
    for (const subscription of this._subscriptions) {
      subscription.unsubscribe();
    }
  }

  private _subscribeToUserDataChange(): Subscription {
    return this._store
      .select(state => state.users)
      .subscribe((users: IUser[]) => {
        this._users = users;
      });
  }

}
