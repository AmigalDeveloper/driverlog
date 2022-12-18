import { Component, OnInit } from '@angular/core';
import { DBServiceService } from '../../shared-service/dbservice.service';
import { LogEntry } from '../log-entry';
import { LogEntriesService } from '../log-entries.service';
import { Subscription } from 'rxjs';

const LOG_ENTRIES_STORE_NAME = 'LogEntries';
const FUEL_ENTRIES_STORE_NAME = 'FuelEntries';


@Component({
  selector: 'app-list-log-entries',
  templateUrl: './list-log-entries.component.html',
  styleUrls: ['./list-log-entries.component.scss'],
})
export class ListLogEntriesComponent implements OnInit {
  logEntries: LogEntry[] = new Array<LogEntry>();
  private logEntriesSub: Subscription;

  constructor(private db: DBServiceService, private logEntriesService: LogEntriesService) {
    console.log('constructor ListLigEntriesComponent', db.getDatabase());
    logEntriesService.getAllData();
  }

  getAllData() {
    this.logEntriesService.getAllData();
  }

  ngOnInit() {

    this.logEntriesSub = this.logEntriesService.getEntries().subscribe( (logEntries: LogEntry) => {
      if(logEntries){
      if(Array.isArray(logEntries)) {
        // is logEntries an Array, then concat
        this.logEntries = this.logEntries.concat( logEntries);
      } else {
        // if logentries isn't an Array then add it first in the array
        this.logEntries.unshift( logEntries);
      }

      // sort the Array on object LogEntry.logEntryDetail.distanceStart, and then reverse the Array, så the higest distanceStart is first
       this.logEntries.sort(
        (a,b): any => b.logEntryDetail.distanceEnd - a.logEntryDetail.distanceEnd
      );}
    }
    );
  }


}
