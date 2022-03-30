import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BaseService } from '../base-service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductReceptionService extends BaseService{
  private servicio = 'productreception/';
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
  update(id:number,data: any): Observable<any> {
    let url = this.servicio + 'update/'+id
    return this.post(this.http, url, data);
  }
  batchProcessed(data: any[]): Observable<any> {
    let url = this.servicio + 'batchprocessed'
    return this.post(this.http, url, data);
  }
  updateReceived(data: any){
    let url = this.servicio + 'updatereceived'
    return this.post(this.http, url, data);      
  }    
  getByInvoice(id:number): Observable <any> {
    let get = this.servicio +"getbyinvoice/"+id
    return this.http.get(this.url + get,{
      headers:{
        'Content-type': 'application/json',
        Authorization: `Bearer ${this.token}`
      }
    });
  }
  getByFolder(id:number): Observable <any> {
    let get = this.servicio +"getbyfolder/"+id
    return this.http.get(this.url + get,{
      headers:{
        'Content-type': 'application/json',
        Authorization: `Bearer ${this.token}`
      }
    });
  }
  batchReceived(id_carpeta:number,close_folder:number,data: any[]){
    let url = this.servicio + 'batchreceived/'+id_carpeta+'/'+close_folder
    return this.post(this.http, url, data);
  }
  getPreviewBatchReceived(data: any[]){
    let url = this.servicio + 'getpreviewbatchreceived'
    return this.post(this.http, url, data);
  }
  processAdvanceValues(id:number,data:any){
    let url = this.servicio + 'processadvancevalues/'+id
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
