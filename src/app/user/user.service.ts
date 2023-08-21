import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DBServiceService } from '../shared-service/dbservice.service';
import { timeout } from 'rxjs';
import { promises, resolve } from 'dns';

const httpOptions = {
  responseType: 'json' as const,
  observe: 'response' as const,
  headers: new HttpHeaders({
    'Content-type': 'application/json' as const,
    Accept: '*/*' as const,
    'Access-Control-Allow-Origin': '*' as const,
    'Referrer-Policy': 'origin-when-cross-origin' as const,
  }),
};

const DATABASE_NAME = 'UserBase';
const DATABASE_VERSION = 1;
const USER_STORE_NAME = 'Users';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnInit {
  database: IDBDatabase;
  userStore: IDBObjectStore;

  constructor(private http: HttpClient, private dbService: DBServiceService) {

    // this.init().then(
    //   (value) => {
    //     console.log('succes ', value, this.database);

    //   },
    //   (error) => {
    //     console.log('error ', error);
    //   }
    // );
  }

  async init() {
    return new Promise((resolve, reject) => {
      const databaseRequest = this.dbService.getDatabase(
        DATABASE_NAME,
        DATABASE_VERSION
      );

      databaseRequest.onupgradeneeded = () => {
        this.database = databaseRequest.result;

        if (!this.database.objectStoreNames.contains(USER_STORE_NAME)) {
          this.userStore = this.database.createObjectStore(USER_STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          if (!this.userStore.indexNames.contains('by_username')) {
            this.userStore.createIndex('by_username', 'username');
          }
        }
      };
      databaseRequest.onsuccess = () => {
        this.database = databaseRequest.result;

        this.userStore = this.database
          .transaction(USER_STORE_NAME)
          .objectStore(USER_STORE_NAME);
        resolve(this.database);
      };

      databaseRequest.onerror = () => {
        const databaseError = databaseRequest.error;
        console.error('some database request fail', databaseError);
        reject(databaseError);
      };
    });
  }

  ngOnInit(): void {
    this.init().then(
      (value) => {
        console.log('succes ', value, this.database);

      },
      (error) => {
        console.log('error ', error);
      }
    );

  }

  register(form: FormGroup) {
    var url = 'https://amigal.dk/webservices/v0a/user/register';

    const body = {
      username: form.value.username,
      password: form.value.password,
      name: form.value.name,
    };

    return this.http.post(url, body, httpOptions);
  }

  login(form: FormGroup) {
    var url = 'https://amigal.dk/webservices/v0a/user/login';

    const body = {
      username: form.value.username,
      password: form.value.password,
      name: form.value.name,
    };

    return this.http.post(url, body, httpOptions);
  }

  async isLoggedIn(): Promise<boolean | string | any> {
    console.log('userService isLoggedIn called', this.userStore, this.database);
    await this.init().then(
      (value) => {
        console.log('succes ', value, this.database);
      },
      (error) => {
        console.log('error ', error);
      }
    );

    return new Promise<boolean>((resolve, reject) => {
      if (this.database) {
        const databaseRequest = this.dbService.getDatabase(
          DATABASE_NAME,
          DATABASE_VERSION
        );
      }
      const userRequest = this.dbService.get(
        this.userStore,
        IDBKeyRange.lowerBound(0)
      );

      userRequest.onsuccess = () => {
        if (userRequest.result) {
          resolve(userRequest.result.isLoggedIn);
        } else resolve(false);
      };

      userRequest.onerror = () => {
        reject(false);
      };
    });
  }
}
