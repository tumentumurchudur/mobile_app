import {FormControl} from "@angular/forms";

export class EmailValidator {

  public static isValid(control: FormControl): any {

    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(control.value);

    if (re) {
      return null;
    }
    return { "invalidEmail": true };
  }

}
