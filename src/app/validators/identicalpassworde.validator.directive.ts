import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';


/** A hero's name can't match the given regular expression */
export const identicalpasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  let password;
  let retypePassword;

  if(control.parent)
  { password = control.parent.value.password;
     retypePassword = control.value;
    }
    const invalid = password != retypePassword;
    return !invalid ? null : {validPassword: {value: control.value}};
  };


@Directive({
  selector: '[appIdenticalpasswordValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: IdenticalpasswordValidatorDirective, multi: true}]
})
export class IdenticalpasswordValidatorDirective implements Validator, OnChanges {
  @Input('appIdenticalpasswordValidator') distanceStart = 0;

  private onChange?: () => void;

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    return  identicalpasswordValidator(control);

  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('retypePassword' in changes) {
      if (this.onChange) {this.onChange();}
    }
  }
}
