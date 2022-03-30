import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BaseService } from '../base-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DirectrizService extends BaseService{
  private servicio = 'directriz/';
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
    getByVersionProduct(id): Observable <any> {
        let get__url =this.servicio + 'getbyversionproduct/' + id
        return this.http.get(this.url +get__url,{
          headers:{
            'Content-type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        });
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
    registerPurchaseNote(data: any): Observable<any> {
        let user_create_url = this.servicio + 'purchasenote/store'
        return this.post(this.http, user_create_url, data);
    }
    
    updatePurchaseNote(id:number,data: any): Observable<any> {
        let user_create_url = this.servicio + 'purchasenote/update/' + id
        return this.post(this.http, user_create_url, data);
    }
    deletePurchaseNote(id): Observable <any> {
        let delete_user_url = this.servicio + 'purchasenote/delete/' + id
        return this.delete(this.http,delete_user_url,{
          headers:{
            'Content-type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        });
    }
    getPurchasesNotes(id): Observable <any> {
        let get__url =this.servicio + 'purchasenote/get/' + id
        return this.http.get(this.url +get__url,{
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
