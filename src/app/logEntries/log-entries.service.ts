import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LogEntry } from './log-entry';
import { DBServiceService } from '../shared-service/dbservice.service';

const DATABASE_NAME = 'DriverLogsBase';
const DATABASE_VERSION = 2;
const LOG_ENTRIES_STORE_NAME = 'LogEntries';
const FUEL_ENTRIES_STORE_NAME = 'FuelEntries';

@Injectable({
  providedIn: 'root',
})
export class LogEntriesService {
  private logEntries = new BehaviorSubject<LogEntry>(new LogEntry());
  private database!: IDBDatabase;
  private logEntriesStore!: IDBObjectStore;
  private fuelEntriesStore!: IDBObjectStore;

  constructor(private dbService: DBServiceService) {
    dbService.init();
    this.init();
  } // End of constructor

  init() {
    // initalizering
    const databaseRequest = this.dbService.getDatabase(
      DATABASE_NAME,
      DATABASE_VERSION
    );

    console.log('databaseRequest init:', databaseRequest);
    console.log('timestamp', new Date().toISOString());

    databaseRequest.onupgradeneeded = () => {
      console.log('databaRequest init logEntries.service', databaseRequest);
      this.database = databaseRequest.result;
      if (!this.database.objectStoreNames.contains(LOG_ENTRIES_STORE_NAME)) {
        this.logEntriesStore = this.database.createObjectStore(
          LOG_ENTRIES_STORE_NAME,
          { autoIncrement: true }
        );
        if (!this.logEntriesStore.indexNames.contains('by_date')) {
          this.logEntriesStore.createIndex('by_date', 'date');
        }
        if (!this.logEntriesStore.indexNames.contains('by_fuel')) {
          this.logEntriesStore.createIndex('by_fuel', 'fuel');
        }

        if (!this.logEntriesStore.indexNames.contains('by_description')) {
          this.logEntriesStore.createIndex('by_description', 'description');
        }
        if (!this.logEntriesStore.indexNames.contains('by_timestamp')){
          this.logEntriesStore.createIndex('by_timestamp','timestamp');
        }
      }

      if (!this.database.objectStoreNames.contains(FUEL_ENTRIES_STORE_NAME)) {
        // if FUEL_ENTRIES_STORE_NAME isn't created, then create it
        this.fuelEntriesStore = this.database.createObjectStore(
          FUEL_ENTRIES_STORE_NAME,
          { autoIncrement: true }
        );
        if (!this.fuelEntriesStore.indexNames.contains('by_logEntryID')) {
          // if index for FUEL_ENTRIES_STORE_NAME isn't created, then create it
          this.fuelEntriesStore.createIndex('by_logEntryID', 'logEntryID');
        }
        if (!this.fuelEntriesStore.indexNames.contains('by_timestamp')){
          this.fuelEntriesStore.createIndex('by_timestamp','timestamp');
        }
      }
    }; // end of databaseReuest.onupgradeneeded

    databaseRequest.onsuccess = () => {
      console.log('databaRequest init logEntries.service', databaseRequest);
      this.database = databaseRequest.result;

      if (!this.database.objectStoreNames.contains(FUEL_ENTRIES_STORE_NAME)) {
        // if FUEL_ENTRIES_STORE_NAME isn't created, then create it
        this.fuelEntriesStore = this.database.createObjectStore(
          FUEL_ENTRIES_STORE_NAME,
          { autoIncrement: true }
        );
        if (!this.fuelEntriesStore.indexNames.contains('by_logEntryID')) {
          // if index for FUEL_ENTRIES_STORE_NAME isn't created, then create it
          this.fuelEntriesStore.createIndex('by_logEntryID', 'logEntryID');
        }
        if (!this.fuelEntriesStore.indexNames.contains('by_timestamp')){
          this.fuelEntriesStore.createIndex('by_timestamp','timeStamp');
        }
      }
    }; // end of databaseReuest.onsucces

    databaseRequest.onerror = () => {
      const error = databaseRequest.error;
      console.error('getDatabase failed in init logentriesService', error);
    };


  } // end of initalizering

  getEntries() {
    return this.logEntries.asObservable();
  }

  updateEntries(logEntry: LogEntry) {
    this.logEntries.next(logEntry);
  } // End og getEntries

  /*
   * @name put
   * @param: logEntry: LogEntry
   * @return: async promise: LogEntry
   * @ description:
   * Store the LogEntry there are created
   *
   */
  async put(logEntry: LogEntry): Promise<any> {
    return new Promise((_resolve, reject) => {
      console.log('logEntries.put this.database', this.database);
      const tx = this.database.transaction(
        [LOG_ENTRIES_STORE_NAME, FUEL_ENTRIES_STORE_NAME],
        'readwrite'
      ); // get transaction start

      // did crete of transaction failed
      tx.onerror = () => {
        console.error('tx fejler', tx.error);
        console.error('tx: ', tx);
        tx.abort(); //abort the transaction
      };

      // store  logEntryDetail
      const logEntryDetail =  {...logEntry.getLogEntryDetail(),timestamp: new Date().toISOString()};
      const logEntryRequest = this.dbService.put(
        tx.objectStore(LOG_ENTRIES_STORE_NAME),
        logEntryDetail
      );


      logEntryRequest.onsuccess = async () => {
        // when it success
        const logEntryID = logEntryRequest.result; // save the Key

        if (logEntry.getLogEntryDetail().fuel) {
          // if fuel is sat, then then add logEntryID to fuelEntryDetai
         const distance = await this.getDistanceFuel(tx,logEntryDetail);
          const fuelEntryDetail = {
            ...logEntry.getFuelEntryDetail(),
            logEntryID,
            distance,
            timestamp: new Date().toISOString()
          };

          // store fuelEntryDetail
          const fuelRequst = this.dbService.put(
            tx.objectStore(FUEL_ENTRIES_STORE_NAME),
            fuelEntryDetail
          );

          // did fuelEntryDetail been storred
          fuelRequst.onsuccess = () => {
            const result = fuelRequst.result;
            console.log('fuelEntry data is saved', result);
            tx.commit(); // commit the transaction
          }; // fuelRequest.onsucces

          // didn't fuelEntryDetail stored
          fuelRequst.onerror = () => {
            tx.abort(); // abort the trasaction
          }; // fuelRequest.onerror
        }
      }; // logEntryRequest.onSuccess

      // didn't logEntryDetail been stored
      logEntryRequest.onerror = () => {
        const error = logEntryRequest.error;
        console.error(' save logEntry fejler', error);
        tx.abort(); // bort the transaction
      }; // logEntryRequest.onerror

      // the transaction been completed
      tx.oncomplete = () => {
        console.log('put is completes');
        this.updateEntries(logEntry); // update logEntries
        _resolve(logEntry); // return the logEntry there are been stored
        return logEntry;
      };

      tx.onabort = () => {
        console.error('save the logEntry data has fault', tx.error);
        reject(tx.error);
        return tx.error;
      };
    });
  } // end of put

  /* @name: getAllData
   *  @param: none
   *  @return:
   */

  getAllData() {
    console.log('getAllData this.db', this.dbService);
    const databaseRequest = this.dbService.getDatabase(DATABASE_NAME,DATABASE_VERSION);
    //const data: Array<LogEntry> = new Array();


    databaseRequest.onsuccess = () => {
      const db = databaseRequest.result;
      const tx = db.transaction(
        [LOG_ENTRIES_STORE_NAME, FUEL_ENTRIES_STORE_NAME],
        'readwrite'
      );

      const logEntryStore = tx.objectStore(LOG_ENTRIES_STORE_NAME).openCursor();

      logEntryStore.onerror = () => {
        console.error('Failed to open cursor', logEntryStore.error);
        tx.abort();
      };

      logEntryStore.onsuccess = () => {
        const cursor = logEntryStore.result;
        if (cursor) {
          if (cursor.value.fuel) {
            const logEntryKey = cursor.key; // get logEntryDetails key
            // get the fuelEntryDetail record by key
            const fuelEntryReq = tx
              .objectStore(FUEL_ENTRIES_STORE_NAME)
              .index('by_logEntryID')
              .get(logEntryKey);

            // when get the fuelEntryDetail record, then add record to logEntry
            fuelEntryReq.onsuccess = () => {
              const fuelEntryDetail = fuelEntryReq.result;
              const logEntryDetail = cursor.value;
              const logEntry = new LogEntry();
              logEntry.setLogEntryDetail(logEntryDetail);
              logEntry.setFuelEntryDetail(fuelEntryDetail);

           fuelEntryReq.onerror = () => {
            const error = fuelEntryReq.error;
            console.log('get fuel failed', error);
           };

              this.updateEntries(logEntry); // send logEntry to logEntries
            };
          } else {
            const logEntry = new LogEntry();
            logEntry.setLogEntryDetail(cursor.value);
            //data.push(logEntry);
            this.updateEntries(logEntry);
          }
          cursor.continue();
        } else {
          tx.commit(); // all Entries is read and comfirm
        }
      };

      tx.oncomplete = () => {
        //data.reverse();
        //if (data) {
         // this.updateEntries(data);
          console.log('getAll data complete');
        //}
      };
    }; // end of getAll
  }

  getLogEntryRecord(key: IDBValidKey | IDBKeyRange | null | undefined) {
    const entryIndexCursor = this.logEntriesStore.openCursor(key);
    entryIndexCursor.onsuccess = () => {
      const entryCursor = entryIndexCursor.result;
      console.log('cursor',entryCursor);
      return entryCursor;
    };

    entryIndexCursor.onerror = () => {
      const error = entryIndexCursor.error;
      console.error('entryCursor fejlede',error);
      return error;
    };


  }

  async getDistanceFuel(transaction: IDBTransaction ,logEntry: { timestamp?: string; date?: Date; distanceStart?: number; distanceEnd: any; description?: string; fuel?: boolean; }) {
    // get distance betwwen fuel

    // create af promise for aync response

    return await new Promise( (resolve, reject) => {


    // get the record with the last timestamp in fuelEntriesStore
    const fuelIndexCursor = transaction.objectStore(FUEL_ENTRIES_STORE_NAME).index('by_timestamp').openCursor(null,'prev');

    //initalize the distance variable
    let tempDistance = null;
    let tempStartDistance = null;
    let tempEndDistance: number;
    let fuelCursor; // initalize the fuelCursor

    tempEndDistance = logEntry.distanceEnd; // let endDistance be ditanceEnd of this logEntry record

    fuelIndexCursor.onsuccess = () =>{ // is there created a cursor on fuelEntriesStore
       fuelCursor = fuelIndexCursor.result; // let fuelCursor be the cursor

       if(fuelCursor){ // if there some values on the cursor then
        const logEntryID = fuelCursor.value.logEntryID; // the logEntryID for the last fuel entry

        // get the logEntry that have relation for the last fuel entry
        const entryRequest =  transaction.objectStore(LOG_ENTRIES_STORE_NAME).get(logEntryID);
        entryRequest.onsuccess = () => { // if we get af value, then
          tempStartDistance = entryRequest.result.distanceEnd; // let the startDistance be the distanceEnd for last fuel
          tempDistance = tempEndDistance - tempStartDistance; // calculate the distance
          console.log('return distance', tempDistance);
          resolve( tempDistance); // return the distance
         };

        entryRequest.onerror = ()=> {
          const error=entryRequest.error;
          console.error('get last distanceEd failed', error);
          transaction.abort();
        };

      } else {
          console.log('no more fuel entries', fuelCursor);
          resolve(null);
      };

    };

    fuelIndexCursor.onerror = () => {
      const fuelError = fuelIndexCursor.error;
      console.error('get Distance open fuelCursor failed', fuelError);
      reject(fuelError);
    };
  }
  );
  }

  getLast() {
    console.log('getValues', this.logEntries.getValue());
    return this.logEntries.getValue();
  }
}
