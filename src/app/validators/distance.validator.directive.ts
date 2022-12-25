import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';


/** A hero's name can't match the given regular expression */
export const distanceValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  let start;
  let end;
  if(control.parent)
  { start = control.parent.value.distanceStart;
     end = control.value;
    }
    const invalid = end < start;
    return !invalid ? null : {validDistance: {value: control.value}};
  };


@Directive({
  selector: '[appDistanceValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: DistanceValidatorDirective, multi: true}]
})
export class DistanceValidatorDirective implements Validator, OnChanges {
  @Input('appDistanceValidator') distanceStart = 0;

  private onChange?: () => void;

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    return  distanceValidator(control);

  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('distanceEnd' in changes) {
      if (this.onChange) {this.onChange();}
    }
  }
}
