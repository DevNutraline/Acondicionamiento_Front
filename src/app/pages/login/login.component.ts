import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { UserService } from "src/app/services/user/user.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { Login } from 'src/app/models/login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  public loginData = new Login();
  public focus:boolean=false;
  public focus1:boolean=false;

  constructor(public spinner: NgxSpinnerService,  
    public router: Router,
  	public userService: UserService,
    public notificationService: NotificationService, ) { }

  ngOnInit() {  	
    this.removeLocalStorageItems();
  }
  removeLocalStorageItems(){
    localStorage.clear();
  }
  login() {
    this.spinner.show()
    this.userService.login(this.loginData).toPromise().then(
      response => {
        if(response.token && response.exp){
          this.notificationService.showSuccess('Operación realiza exitosamente','Inicio de sesión exitoso')
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('expires_in', `${response.exp}`);
          localStorage.setItem('user', JSON.stringify(response));
          this.router.navigate(['dashboards/alternative']);
          this.spinner.hide();
        }
      }
    ).catch(
      error =>{
        this.spinner.hide();
        this.notificationService.showError('Error',error.error) 
        console.log("error:",error)
      }
    )
  }

}
