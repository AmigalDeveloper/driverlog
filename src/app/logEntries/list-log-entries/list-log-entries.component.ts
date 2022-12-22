import { Component, OnInit } from '@angular/core';
import { DBServiceService } from '../../shared-service/dbservice.service';
import { LogEntry } from '../log-entry';
import { LogEntriesService } from '../log-entries.service';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { EditLogEntryFormComponent } from '../edit-log-entry-form/edit-log-entry-form.component';

const LOG_ENTRIES_STORE_NAME = 'LogEntries';
const FUEL_ENTRIES_STORE_NAME = 'FuelEntries';

@Component({
  selector: 'app-list-log-entries',
  templateUrl: './list-log-entries.component.html',
  styleUrls: ['./list-log-entries.component.scss'],
})
export class ListLogEntriesComponent implements OnInit {
  logEntries: LogEntry[] = new Array<LogEntry>();
  private logEntriesSub: Subscription = new Subscription();

  constructor(
    private db: DBServiceService,
    private logEntriesService: LogEntriesService,
    private modalCtrl: ModalController
  ) {
    console.log('constructor ListLigEntriesComponent', db.getDatabase());
    logEntriesService.getAllData();
  }

  showDetail(selectedEntry: LogEntry) {
    console.log('showDetail input', selectedEntry);
    this.modalCtrl
      .create({
        component: EditLogEntryFormComponent,
        componentProps: { selectedEntry: selectedEntry },
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      }); /*
      .then(resultData => {
        console.log(resultData.data, resultData.role);
        if (resultData.role === 'confirm') {
          console.log('BOOKED!');
        }
      });*/
  }

  getAllData() {
    this.logEntriesService.getAllData();
  }

  ngOnInit() {
    this.logEntriesSub = this.logEntriesService
      .getEntries()
      .subscribe((logEntries: LogEntry) => {
        if (logEntries) {
          if (Array.isArray(logEntries)) {
            // is logEntries an Array, then concat
            this.logEntries = this.logEntries.concat(logEntries);
          } else {
            // if logentries isn't an Array then add it first in the array
            const index = this.logEntries.findIndex(
              (entry) =>
                entry.logEntryDetail.id === logEntries.LogEntryDetail.id
            );
            if (index < 0) {
              this.logEntries.unshift(logEntries);
            } else {
              this.logEntries.fill(logEntries, index, index + 1);
            }
          }

          // sort the Array on object LogEntry.logEntryDetail.distanceStart, and then reverse the Array, så the higest distanceStart is first
          this.logEntries.sort(
            (a, b): any =>
              b.logEntryDetail.timestamp - a.logEntryDetail.timestamp
          );
        }
      });
  }
}
