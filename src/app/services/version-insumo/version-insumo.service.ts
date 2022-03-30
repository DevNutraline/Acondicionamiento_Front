import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BaseService } from '../base-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VersionInsumoService extends BaseService{
  private servicio = 'versioninsumo/';
  public url = environment.base_url;
  
  constructor(private http: HttpClient) { 
    super();
    console.log(this.http);    
  }
  get token(): string {
      return localStorage.getItem("access_token");
  }
  getAll(): Observable<any> {      
      return this.http.get(this.url +  this.servicio,{
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
