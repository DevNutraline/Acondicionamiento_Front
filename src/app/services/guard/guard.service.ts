import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base-service';
import { Observable } from 'rxjs'; 

@Injectable()
export class GuardService extends BaseService {
    private servicio = 'auth/';
    constructor(private http: HttpClient) {
        super();
    }
   	isLoggedIn() {
	    return !!this.getJwtToken();
	}
	getJwtToken() {
	    return localStorage.getItem("access_token");
	}
	isAuthUser():any{
		this.getAuthUser()
			.toPromise()
			.then(response => {return true;})
			.catch(error => {return false;});
	}
	getAuthUser(): Observable <any> {
        let get_auth_user = this.servicio  + 'user'
        return this.http.get(this.url + get_auth_user,{headers:{'Content-type': 'application/json'}});
    }
    getAuthToken() {
	    return Promise.resolve('ddd');
	  }
    refreshToken() {
	    return new Promise(resolve => {
	      setTimeout(() => {
	        console.log('refresh');
	        resolve('xxx');
	      }, 1000);
	    });
	  }

}

