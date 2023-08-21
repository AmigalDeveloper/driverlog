import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

const httpOptions ={
  responseType: 'json' as const,
  observe: 'response' as const,
  headers: new HttpHeaders({
    "Content-type": 'application/json' as const,
    'Accept': '*/*' as const,
    'Access-Control-Allow-Origin': '*' as const,
    'Referrer-Policy': 'origin-when-cross-origin' as const
  })

}

@Injectable({
  providedIn: 'root'
})
export class UserService {


  constructor(private http: HttpClient) { }

  register(form: FormGroup){
    var url='https://amigal.dk/webservices/v0a/user/register';

    const body = {
      "username": form.value.username,
      "password": form.value.password,
      "name": form.value.name
    }

    return this.http.post(url,body,httpOptions);

  }
}
