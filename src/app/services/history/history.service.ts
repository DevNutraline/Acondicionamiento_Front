import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BaseService } from '../base-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService extends BaseService{
  private servicio = 'history/';
  public url = environment.base_url;

  constructor(private http: HttpClient) { 
    super();   
  }
  get token(): string {
      return localStorage.getItem("access_token");
  }

    getAll(): Observable <any> {
        let get_all__url = this.servicio 
        return this.http.get(this.url + get_all__url,{
          headers:{
            'Content-type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        });
    }

  
    errorHandl(error) {
      let errorMessage = '';
      if(error.error instanceof ErrorEvent) {
        // Get client-side error
        errorMessage = error.error.message;
      } else {
        // Get server-side error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      return throwError(errorMessage);
   }
}
