import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BaseService } from '../base-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SaleNoteService extends BaseService{
  private servicio = 'salenote/';
  public url = environment.base_url;
  
  constructor(private http: HttpClient) { 
    super(); 
  }
  get token(): string {
      return localStorage.getItem("access_token");
  }
    getByFolderCode(data: any): Observable<any> {
        let user_create_url = this.servicio + 'getbyfoldercode'
        return this.post(this.http, user_create_url, data);
    }
    sendNotes(data: any): Observable<any> {
        let user_create_url = this.servicio + 'sendnotes'
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
