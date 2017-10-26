import { Injectable } from '@angular/core';
import { Effect, toPayload, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/rx';

@Injectable()
export class MainEffects {
  constructor(
    private readonly _actions$: Actions
  ) { }

}
