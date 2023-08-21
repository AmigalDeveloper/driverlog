import { Injectable } from '@angular/core';

const DATABASE_NAME = 'DriverLogsBase';
const DATABASE_VERSION = 1;

@Injectable({
  providedIn: 'root',
})
export class DBServiceService {
  private db!: IDBDatabase; // store database id
  private driverLogStore: any; // store the driverLogStore
  private fuelStore: any; // store the fuelStore

  constructor() {
    // create the DB connection
    this.init(); // initalize the DB
  }

  /*
   * @name: init
   * @param: none
   * @return: void
   * @description: initalieze the database and create neceries object store
   */

  init() {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION); // initalize database

    request.onupgradeneeded =  () => {
      // when first time to call the database or the database is upgrade
      this.db = request.result; // save the database

      if (!this.db.objectStoreNames.contains('LogEntries')) {
        // if logEntry store is not created, then create it
        // auto generate key
        const driverLogStore = this.db.createObjectStore('LogEntries', {
          keyPath: 'id',
          autoIncrement: true,
        });

        // create index for description
        const descriptionIndex = driverLogStore.createIndex(
          'by_description',
          'description'
        );

        const dateIndex = driverLogStore.createIndex('by_date', 'date'); // create index for date

        const fuelIndex = driverLogStore.createIndex('by_fuel', 'fuel'); // create index for about there is tank fuel
        const driverLogTimestampIndex = driverLogStore.createIndex('by_timestamp','timestamp');
      }
      if (!this.db.objectStoreNames.contains('FuelEntries')) {
        // if FuelEntries is not an object store, then create it
        // auto generate key
        const fuelStore = this.db.createObjectStore('FuelEntries', {
          keyPath: 'id',
          autoIncrement: true,
        });

        // create index for logEntryID
        const driverLogsIdIndex = fuelStore.createIndex(
          'by_logEntryID',
          'logEntryID'
        );
         const fuelTimestampIndex = fuelStore.createIndex('by_timestamp','timestamp');
      }
    };

    request.onsuccess = () => {
      // when succes save the db
      this.db = request.result;
      console.log('the databese is create and initilize', this.db);
      return this.db;
    };

    // Databse didn't been created
    request.onerror = () => {
      console.error('open db have failed', request.error);
      return request.error;
    };
  }

  /*
   * @name: getDatabase
   * @param: none
   * @return: the database type IDBOpenDBRequest
   * @description: get the database
   */

  getDatabase(database = DATABASE_NAME, version = DATABASE_VERSION): IDBOpenDBRequest {
    console.log('getDatabase parameter', database,version);
    return  indexedDB.open(database,version);
  }

  //
  // @name = getAll
  // @descriotion = henter alle data i fra databasen DriverLogs LogEntry store
  //                finder herefter de stede der er tanket
  // @param none
  //

  getAll() {
    // if db is not defined, then open it again

    console.log('indexedDB ', indexedDB);
      const request = indexedDB.open('DriverLogsBase', 1); // initalize database
      request.onsuccess = () => {
        this.db = request.result;
      };
      const tx = this.db.transaction(
        ['LogEntries', 'FuelEntries'],
        'readwrite'
      ); // start transaction
      console.log('transaction created', tx);
      const logEntryStore = tx.objectStore('LogEntries').getAll(); // hent alle data i logEntry store
      let data: any[];
      console.log('logEntryStore is creates', logEntryStore);

      logEntryStore.onsuccess = async () => {
        data = logEntryStore.result;
        console.log('getted data', data);

        data.forEach(
          (element: { fuel: any }, index: number) => {
            if (element.fuel) {
              const fuelEntryStore = tx.objectStore('FuelEntries');
              console.log('fuelEntryStore', fuelEntryStore);
              const driverLogIDIndex = fuelEntryStore.index('by_logEntryID');
              console.log('fuelEntryStore', driverLogIDIndex);
              console.log('index', index);

              const fuelEntryReq = driverLogIDIndex.get(index + 1);
              console.log('fuelEntryReq', fuelEntryReq);
              fuelEntryReq.onsuccess = async () => {
                const fuelEntryDetail = fuelEntryReq.result;
                console.log('fuelEntryReq-> detail', fuelEntryDetail);
                const logEntryDetail = element;

                data[index] = { logEntryDetail, fuelEntryDetail };
                console.log('data with fuelEntryDetail ', data[index]);
              };
            } else {
              data[index] = { logEntryDetail: element };
            }
          },
          (error: any) => console.error('noget gik galt ', error)
        );
        console.log('data for return succes ', data);
        // return data;
      };

      tx.oncomplete = () => {
        console.log('getAll done');
        console.log('data for return complete', data);
        return data;
      };
  }

  async getAllData(): Promise<any> {
    const tx = this.db.transaction(['LogEntries', 'FuelEntries'], 'readwrite'); // start transaction
    console.log('transaction created', tx);
    const logEntryStore = tx.objectStore('LogEntries').getAll(); // hent alle data i logEntry store
    let data: any[];
    console.log('logEntryStore is creates', logEntryStore);

    logEntryStore.onsuccess = async () => {
      data = logEntryStore.result;
      console.log('getted data', data);

      data.forEach(
        (element: { fuel: any }, index: number) => {
          if (element.fuel) {
            const fuelEntryStore = tx.objectStore('FuelEntries');
            console.log('fuelEntryStore', fuelEntryStore);
            const driverLogIDIndex = fuelEntryStore.index('by_logEntryID');
            console.log('fuelEntryStore', driverLogIDIndex);
            console.log('index', index);

            const fuelEntryReq = driverLogIDIndex.get(index + 1);
            console.log('fuelEntryReq', fuelEntryReq);
            fuelEntryReq.onsuccess = async () => {
              const fuelEntryDetail = fuelEntryReq.result;
              console.log('fuelEntryReq-> detail', fuelEntryDetail);
              const logEntryDetail = element;

              data[index] = { logEntryDetail, fuelEntryDetail };
              console.log('data with fuelEntryDetail ', data[index]);
            };
          } else {
            data[index] = { logEntryDetail: element };
          }
        },
        (error: any) => console.error('noget gik galt ', error)
      );
      console.log('data for return succes ', data);
      //return data;
    };

    tx.oncomplete = () => {
      console.log('getAll done');
      console.log('data for return complete', data);
      return data;
    };
    //return data;
  }

   put(objectStore: IDBObjectStore, value: any, key?: any): IDBRequest {
    const returnPut = objectStore.put(value,key);
    console.log('objectStore.put returnPut',returnPut);
    return  returnPut;
       //const putResult = database.transaction(_objectStoreName,'readwrite').objectStore(_objectStoreName).put(value);
  }


 }
