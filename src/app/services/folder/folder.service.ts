import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BaseService } from '../base-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FolderService extends BaseService{
  private servicio = 'carpeta/';
  public url = environment.base_url;

  constructor(private http: HttpClient) { 
    super();   
  }
  get token(): string {
      return localStorage.getItem("access_token");
  }
    create(data: any): Observable<any> {
        let url = this.servicio + 'store'
        return this.post(this.http, url, data);
    }

    getAll(): Observable <any> {
        let url = this.servicio 
        return this.http.get(this.url + url,{
          headers:{
            'Content-type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        });
    }
    getFolderCommercialStatues(): Observable <any> {
        let url = this.servicio + `foldercommercialstatues`
        return this.http.get(this.url + url,{
          headers:{
            'Content-type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        });
    }

    deleteElement(id): Observable <any> {
        let url = this.servicio + `delete/${id}`
        return this.delete(this.http,url,{
          headers:{
            'Content-type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        });
    }

    updateElement(id, data: any): Observable <any> {
        let url = this.servicio + `update/${id}`
        return this.post(this.http, url, data);
    }

    get(id): Observable <any> {
        let get__url = this.servicio + `${id}`
        return this.http.get(get__url,{
          headers:{
            'Content-type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        });
    }
    releaseForSale(id, data: any): Observable <any>{
      let url = this.servicio + `releaseforsale/${id}`
      return this.post(this.http, url, data);
    }
    processEstimatedDate(id, data: any): Observable <any>{
      let url = this.servicio + `processestimateddate/${id}`
      return this.post(this.http, url, data);
    }
    processPriority(id, data: any): Observable <any>{
      let url = this.servicio + `processpriority/${id}`
      return this.post(this.http, url, data);
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
