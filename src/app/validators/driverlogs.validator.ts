import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export class DriverLogValidators implements Validators {


static distance(start: number): ValidatorFn {
  console.log('distance kaldt- control.value:',start);
  return (control: AbstractControl): ValidationErrors | null => {
    console.log('control: ', control);
    return {valid: false};
  };
  }
}
