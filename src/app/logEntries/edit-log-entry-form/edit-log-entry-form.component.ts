import { Component, OnInit, Input } from '@angular/core';
import { LogEntry } from '../log-entry';
import { FormGroup, FormControl, Validators, FormBuilder, Form } from '@angular/forms';

import { LogEntriesService } from '../log-entries.service';
import { DriverLogValidators } from '../../validators/driverlogs.validator';
import { Subscription } from 'rxjs';
import { distanceValidator } from '../../validators/distance.validator.directive';

@Component({
  selector: 'app-edit-log-entry-form',
  templateUrl: './edit-log-entry-form.component.html',
  styleUrls: ['./edit-log-entry-form.component.scss'],
})
export class EditLogEntryFormComponent implements OnInit {
  @Input() appDistanceValidator = DriverLogValidators.distance;
  description: any;
  distanceEnd: number | Subscription = new Subscription;
  distanceStart!: number;
  logEntries: any;
  now: Date;
  form;

  driverlogForm: any;
editDriverLogItemForm: any;


  constructor(
    private entriesService: LogEntriesService,
    public fb: FormBuilder
  ) {
    entriesService.init();
    this.now = new Date();
    console.log('toLocalDateString', this.now.toLocaleDateString());
    console.log('toLocalString', this.now.toLocaleString());
    console.log('toLocalTimeString', this.now.toLocaleTimeString());

    this.form = this.fb.group({
      date: new FormControl(new Date().toISOString().substring(0,19),{nonNullable: true}),
      description: new FormControl('',{nonNullable: true}),
      distanceStart: new FormControl(this.distanceEnd,{nonNullable: true}),
      distanceEnd: new FormControl(this.distanceEnd,distanceValidator),
      fuel: new FormControl(false,{nonNullable: true}),
      amounts: new FormControl(0, {nonNullable: true}),
      amountUnit: new FormControl('Liter', {nonNullable: true}),
      priceUnit: new FormControl(0,{nonNullable: true})
    });


   }

  onSubmit(form: FormGroup) {
    console.log('input til onSubmit', form);
    console.log('form.value.date',form.value.date);
    console.log('form.value.date convert to Date',new Date(form.value.date));
if(form.value.date && form.valid){

    // Create LogEntry object
    const logEntry = new LogEntry();
    // update Logentry object with data from form
    logEntry.setLogEntryDetail({
      date: form.value.date,
      distanceStart: form.value.distanceStart,
      distanceEnd: form.value.distanceEnd,
      description: form.value.description,
      fuel: form.value.fuel,
    });
    // if fuel is entered, then add data for fuel to LogEntry object
    if (form.value.fuel) {
      logEntry.setFuelEntryDetail({
        amount: form.value.amounts,
        amountUnit: form.value.amountUnit,
        priceUnit: form.value.priceUnit,
      });
    }
    console.log('logEntry klar', logEntry);
    // then update with the DriverLogs with LogEntry
    //    const logEntryPutResult = this.entriesService.put(form);
    const logEntryPutResult = this.entriesService.put(logEntry);
    console.log('reultat er Put', logEntryPutResult);
    logEntryPutResult.then(
      (result) => {
        console.log('resultatet af promise er ', result);
        form.reset(
         );
        this.now =new Date();
      },
      (error) => console.error('logEntry saved failen', error)
    );}
  }

  onClick() {}

  ngOnInit() {
    this.distanceEnd = this.entriesService
      .getEntries()
      .subscribe((logEntries: LogEntry) => {

      if(logEntries){
        if (Array.isArray(logEntries)) {
          // is logEntries an Array, then concat
          this.distanceEnd = logEntries[0].logEntryDetail.distanceEnd;
        } else {
          // if logentries isn't an Array then add it first in the array
          this.distanceEnd = logEntries.logEntryDetail.distanceEnd;
        }}
      });
  }
}

