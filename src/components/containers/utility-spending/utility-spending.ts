import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/reducers';
import { Observable } from "rxjs/Observable";
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
  private _orgPath: string = '';
  private _meters: IMeter[] = [];

  constructor(
    private _store: Store<AppState>,
    private _db: DatabaseProvider
  ) { }

  ngOnInit() {
    this._subscriptions.push(this._subscribeToUserDataChange());

    this._db.getOrgPathForUser(this.user.uid)
    .switchMap(path => {
      this._orgPath = path;

      return this._db.getMetersForOrg(path);
    }).subscribe(meter => {
      console.log(meter);
      this._meters = [meter];
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
