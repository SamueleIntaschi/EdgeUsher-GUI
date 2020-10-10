import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class HttpService {

  //URL of the python server
  constructor(private http: HttpClient) { }

  postQuery(url, string, eu, last) {
    console.log('sending query to ' + url);
    return this.http.post(url, {query: string, eu: eu, last: last}, {responseType: 'text'});
  }

  postQueryFinal(url, chain, infrastructure, query, eu, last) {
    console.log('sending query final to ' + url);
    return this.http.post(url, {chain: chain, infrastructure: infrastructure, query: query, eu: eu, last: last}, {responseType: 'text'});
  }

  postClearBackend(url) {
    return this.http.post(url, {clear: 1}, {responseType: 'text'});
  }

  postFile (url, file: FormData) {
    console.log('send file to ' + url);
    var f = JSON.stringify({file:file});
    let headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type':  'application/json',
      'Authorization': 'my-auth-token'
    });
    const httpOptions = {
      headers: headers,
      responseType: "text",
    };
    
    return this.http.post(url, file, {responseType: 'text'});
  }

}
