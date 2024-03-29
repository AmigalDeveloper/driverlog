import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LogEntry } from './log-entry';
import { DBServiceService } from '../shared-service/dbservice.service';

const DATABASE_NAME = 'DriverLogsBase';
const DATABASE_VERSION = 1;
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
  private lastDistanceEnd: number | undefined;

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
          { keyPath: 'id', autoIncrement: true }
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
        if (!this.logEntriesStore.indexNames.contains('by_timestamp')) {
          this.logEntriesStore.createIndex('by_timestamp', 'timestamp');
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
        if (!this.fuelEntriesStore.indexNames.contains('by_timestamp')) {
          this.fuelEntriesStore.createIndex('by_timestamp', 'timestamp');
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
          { keyPath: 'id', autoIncrement: true }
        );
        if (!this.fuelEntriesStore.indexNames.contains('by_logEntryID')) {
          // if index for FUEL_ENTRIES_STORE_NAME isn't created, then create it
          this.fuelEntriesStore.createIndex('by_logEntryID', 'logEntryID');
        }
        if (!this.fuelEntriesStore.indexNames.contains('by_timestamp')) {
          this.fuelEntriesStore.createIndex('by_timestamp', 'timeStamp');
        }
      }
    }; // end of databaseReuest.onsucces

    databaseRequest.onerror = () => {
      const error = databaseRequest.error;
      console.error('getDatabase failed in init logentriesService', error);
    };
  } // end of initalizering

  get distanceEnd() {
    return this.lastDistanceEnd;
  }

  /* @name getEntries
   *  @param: none
   *  @return: (observable) logEntries
   */

  getEntries() {
    return this.logEntries.asObservable();
  }

  /* @name updateEntries
   *  @param: LogEntry
   *  @return: void
   */
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
      const logEntryDetail = {
        ...logEntry.LogEntryDetail,
        timestamp: !logEntry.LogEntryDetail.timestamp
          ? new Date().toISOString()
          : logEntry.LogEntryDetail.timestamp,
      };

      // store the LogEntry in database
      const logEntryRequest = this.dbService.put(
        tx.objectStore(LOG_ENTRIES_STORE_NAME),
        logEntryDetail
      );

      logEntryRequest.onsuccess = async () => {
        // when it success
        const logEntryID = logEntryRequest.result; // save the Key
        logEntry.setLogEntryDetail({ ...logEntryDetail, id: logEntryID });

        if (logEntry.LogEntryDetail.fuel) {
          // if fuel is sat, then then add logEntryID to fuelEntryDetai

          const distance = await this.getDistanceFuel(tx, logEntryDetail); // find the distance from last fuel
          const fuelEntryDetail = {
            ...logEntry.FuelEntryDetail,
            logEntryID,
            distance: Number(distance).valueOf(),
            timestamp: !logEntry.fuelEntryDetail.timestamp
              ? new Date().toISOString()
              : logEntry.fuelEntryDetail.timestamp,
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
            logEntry.setFuelEntryDetail({ ...fuelEntryDetail, id: result });
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
        // return logEntry;
      };

      tx.onabort = () => {
        console.error('save the logEntry data has fault', tx.error);
        reject(tx.error);
        // return tx.error;
      };
    });
  } // end of put

  async delete(logEntryKey) {
    const tx = this.database.transaction(
      [LOG_ENTRIES_STORE_NAME, FUEL_ENTRIES_STORE_NAME],
      'readwrite'
    );

    tx.oncomplete = () => {
      console.log('logEntry with key ' + logEntryKey + ' is deleted');
    };

    tx.onerror = () => {
      console.error(
        'delete of logEntry with key ' + logEntryKey + 'is failed',
        tx.error
      );
    };

    const logEntryStore = tx.objectStore(LOG_ENTRIES_STORE_NAME);

    const logEntryRequest = logEntryStore.get(logEntryKey);

    logEntryRequest.onerror = () => {
      console.error('can\'t get the logentry record', logEntryRequest.error);
      tx.abort();
    }

    logEntryRequest.onsuccess = () => {
      const logEntry = logEntryRequest.result;

      if (logEntry.fuel) {
        const fuelStore = tx.objectStore(FUEL_ENTRIES_STORE_NAME);

        const fuelKey = fuelStore.index('by_logEntryID').getKey(logEntry.id);

        fuelKey.onsuccess = () => {
          console.log('fuelkey is ' + fuelKey.result);

          if (fuelKey.result !== undefined && fuelKey.result) fuelStore.delete(fuelKey.result);
        };

        fuelKey.onerror = () => {
          console.error("Can't find the key" + logEntryKey, fuelKey.error);
        };
      }

      const logEntryDeleteRequest = logEntryStore.delete(logEntryKey);

      logEntryDeleteRequest.onsuccess = () => {
        console.log(
          'logEntry with key ' + logEntryKey + ' is deleted',
          logEntryDeleteRequest.result
        );
      };
    };
  }

  /* @name: getAllData
   *  @param: none
   *  @return: Array of LogEntry
   */
  getAllData() {
    console.log('getAllData this.db', this.dbService);
    const databaseRequest = this.dbService.getDatabase(
      DATABASE_NAME,
      DATABASE_VERSION
    );
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
        console.log('getAll data complete');
      };
    }; // end of getAll
  }

  /*
   * @name: getDistance
   * @param transaction  * the transaction where this should be a part of
   * @param logEntry     * the logEntry where is the end logentry
   * @return Promise<Number>
   */
  async getDistanceFuel(
    transaction: IDBTransaction,
    logEntry: {
      timestamp?: string;
      date?: Date;
      distanceStart?: number;
      distanceEnd: any;
      description?: string;
      fuel?: boolean;
      id?;
    }
  ) {
    // get distance betwwen fuel

    // for update record then we get the keyrange not newer then timestamp
    const keyRangeValue = IDBKeyRange.upperBound(logEntry.timestamp, true);

    // create af promise for aync response

    return await new Promise((resolve, reject) => {
      // get the record with the last timestamp in fuelEntriesStore
      const fuelIndexCursor = transaction
        .objectStore(FUEL_ENTRIES_STORE_NAME)
        .index('by_timestamp')
        .openCursor(keyRangeValue, 'prev');

      //initalize the distance variable
      let tempDistance = null;
      let tempStartDistance = null;
      let tempEndDistance: number;
      let fuelCursor; // initalize the fuelCursor

      tempEndDistance = logEntry.distanceEnd; // let endDistance be ditanceEnd of this logEntry record

      fuelIndexCursor.onsuccess = () => {
        // is there created a cursor on fuelEntriesStore
        fuelCursor = fuelIndexCursor.result; // let fuelCursor be the cursor

        if (fuelCursor) {
          // if there some values on the cursor then
          const logEntryID = fuelCursor.value.logEntryID; // the logEntryID for the last fuel entry

          if (logEntryID === logEntry.id) {
            fuelCursor.continue();
          } else {
            // get the logEntry that have relation for the last fuel entry
            const entryRequest = transaction
              .objectStore(LOG_ENTRIES_STORE_NAME)
              .get(logEntryID);
            entryRequest.onsuccess = () => {
              // if we get af value, then
              tempStartDistance = entryRequest.result.distanceEnd; // let the startDistance be the distanceEnd for last fuel
              tempDistance = tempEndDistance - tempStartDistance; // calculate the distance
              console.log('return distance', tempDistance);
              resolve(tempDistance); // return the distance
            };

            entryRequest.onerror = () => {
              const error = entryRequest.error;
              console.error('get last distanceEd failed', error);
              transaction.abort();
            };
          }
        } else {
          console.log('no more fuel entries', fuelCursor);
          resolve(tempEndDistance - 0);
        }
      };

      fuelIndexCursor.onerror = () => {
        const fuelError = fuelIndexCursor.error;
        console.error('get Distance open fuelCursor failed', fuelError);
        reject(fuelError);
      };
    });
  }
}
