import { Component, OnInit, Input } from '@angular/core';
import { LogEntry } from '../log-entry';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  Form,
} from '@angular/forms';

import { LogEntriesService } from '../log-entries.service';
import { DriverLogValidators } from '../../validators/driverlogs.validator';
import { Subscription } from 'rxjs';
import { distanceValidator } from '../../validators/distance.validator.directive';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit-log-entry-form',
  templateUrl: './edit-log-entry-form.component.html',
  styleUrls: ['./edit-log-entry-form.component.scss'],
})
export class EditLogEntryFormComponent implements OnInit {
  @Input() selectedEntry: LogEntry;
  //@Input() appDistanceValidator = DriverLogValidators.distance;
  // description: any;
  distanceEnd$: number | Subscription = new Subscription();
  distanceEnd: number | undefined = 100;
  // distanceStart!: number;
  // logEntries: any;
  now: Date;
  form: FormGroup<any> | FormGroup<{ date: FormControl<string | Date>; description: FormControl<string>; distanceStart: FormControl<number>; distanceEnd: FormControl<number>; fuel: FormControl<boolean>; amount: FormControl<number>; amountUnit: FormControl<string>; priceUnit: FormControl<number>; }>;

  //  driverlogForm: any;
  //  editDriverLogItemForm: any;

  constructor(
    private entriesService: LogEntriesService,
    public fb: FormBuilder,
    private modalCtrl: ModalController
  ) {
    console.log('input', this.selectedEntry);
    entriesService.init();
    this.ngOnInit();
    this.now = new Date();

  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
    console.log('input ved cancel', this.selectedEntry);
  }

  confirm() {
    return this.modalCtrl.dismiss(this.onSubmit(this.form), 'confirm');
  }

  onSubmit(form: FormGroup) {
    console.log('input til onSubmit', form);
    if (form.value.date && form.valid) {
      // Create LogEntry object
      let logEntry;
      if(this.selectedEntry) { logEntry = this.selectedEntry} else { logEntry = new LogEntry();}
      // update Logentry object with data from form
      logEntry.setLogEntryDetail({...logEntry.logEntryDetail,
        date: form.value.date,
        distanceStart: form.value.distanceStart,
        distanceEnd: form.value.distanceEnd,
        description: form.value.description,
        fuel: form.value.fuel,
      });
      // if fuel is entered, then add data for fuel to LogEntry object
      if (form.value.fuel) {
        logEntry.setFuelEntryDetail({...logEntry.fuelEntryDetail,
          amount: form.value.amount,
          amountUnit: form.value.amountUnit,
          priceUnit: form.value.priceUnit,
       });
      }
      const logEntryPutResult = this.entriesService.put(logEntry);
      logEntryPutResult.then(
        (result) => {
          form.reset();
          this.now = new Date();
        },
        (error) => console.error('logEntry saved failen', error)
      );
    }
  }

  onClick() {}

  ngOnInit() {
    console.log('onInit input', this.selectedEntry);
    this.distanceEnd$ = this.entriesService
      .getEntries()
      .subscribe((logEntries: LogEntry) => {
        if (logEntries) {
          if (Array.isArray(logEntries)) {
            // is logEntries an Array, then concat
            this.distanceEnd = logEntries[0].logEntryDetail.distanceEnd;
          } else {
            // if logentries isn't an Array then add it first in the array
            this.distanceEnd = logEntries.logEntryDetail.distanceEnd;
          }
        }
      });
   // if (this.selectedEntry) {
      this.form = this.fb.group({
        date: new FormControl(
          this.selectedEntry
            ? this.selectedEntry.logEntryDetail.date
            : new Date().toISOString().substring(0, 19),
          {
            nonNullable: true,
          }
        ),
        description: new FormControl(
          this.selectedEntry
           ? this.selectedEntry.logEntryDetail.description
            : '',
          { nonNullable: true }
        ),
        distanceStart: new FormControl(
          this.selectedEntry
            ? this.selectedEntry.logEntryDetail.distanceStart
            : this.distanceEnd,
          { nonNullable: true }
        ),
        distanceEnd: new FormControl(
          this.selectedEntry ? this.selectedEntry.logEntryDetail.distanceEnd : this.distanceEnd, distanceValidator),
        fuel: new FormControl(
          this.selectedEntry
            ? this.selectedEntry.logEntryDetail.fuel
            : false,
          { nonNullable: true }
        ),
        amount: new FormControl(
          this.selectedEntry
            ? this.selectedEntry.fuelEntryDetail.amount
            : 0,
          { nonNullable: true }
        ),
        amountUnit: new FormControl(
          this.selectedEntry
            ? this.selectedEntry.fuelEntryDetail.amountUnit
            : 'Liter',
          { nonNullable: true }
        ),
        priceUnit: new FormControl(
          this.selectedEntry
            ? this.selectedEntry.fuelEntryDetail.priceUnit
            : 0,
          { nonNullable: true }
        ),
      });
  //  }
  }
}
