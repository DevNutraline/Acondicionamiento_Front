import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BaseService } from '../base-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplieInventoryComparativeService extends BaseService{
  private servicio = 'inventarioinsumocomparativa/';
  public url = environment.base_url;
  
  constructor(private http: HttpClient) { 
    super();
  }
  get token(): string {
      return localStorage.getItem("access_token");
  }
    

    getAll(): Observable <any> {
        let get_all_users_url = this.servicio 
        return this.http.get(this.url + get_all_users_url,{
          headers:{'Content-type': 'application/json',
          Authorization: `Bearer ${this.token}`
        }
      });
    }
    
    sendReport(data: any): Observable<any> {
        let user_create_url = this.servicio + 'sendreport'
        return this.post(this.http, user_create_url, data);
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
