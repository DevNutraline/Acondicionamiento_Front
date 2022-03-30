import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BaseService } from '../base-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VersionProductService extends BaseService{
  private servicio = 'versionproduct/';
  public url = environment.base_url;
  
  constructor(private http: HttpClient) { 
    super();
  }
  get token(): string {
      return localStorage.getItem("access_token");
  }
   create(data: any): Observable<any> {
        let user_create_url = this.servicio + 'store'
        return this.post(this.http, user_create_url, data);
    }

    getAll(): Observable <any> {
        let get_all_users_url = this.servicio 
        return this.http.get(this.url + get_all_users_url,{
          headers:{
            'Content-type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        });
    }
    get(id): Observable <any> {
        let get_all_users_url = this.servicio + `${id}`
        return this.http.get(this.url + get_all_users_url,{
          headers:{
            'Content-type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        });
    }

    deleteElement(user_id): Observable <any> {
        let delete_user_url = this.servicio + `delete/${user_id}`
        return this.delete(this.http,delete_user_url,{
          headers:{
            'Content-type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        });
    }

    updateElement(id, data: any): Observable <any> {
        let update_user_url = this.servicio + `update/${id}`
        return this.post(this.http,update_user_url, data);
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
