import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { UserService } from "src/app/services/user/user.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { User } from "src/app/models/user";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public user:User=null;
  public userForm:User=null;

  constructor(
    public userService:UserService,
    public notificationService: NotificationService,
    public spinner: NgxSpinnerService ) { }

  ngOnInit() {
  	this.getUser();
  }
  /*obtiene usuario en sesión desde localStorage*/
  getUser(){
  	this.user=JSON.parse(localStorage.getItem("user")).user;
  	this.userForm=Object.assign({},this.user);
  }
  /*actualiza perfil de usuario*/
  	register(){
          this.spinner.show();
          this.userService.updateElement(this.userForm.id, this.userForm).toPromise().then(
            response => {
            	if(response!=undefined && response.data){
            		this.user=response.data;
            		this.userForm=Object.assign({},this.user);
            		const userLS=JSON.parse(localStorage.getItem("user"));
            		userLS.user=response.data;
        			localStorage.setItem('user', JSON.stringify(userLS));
              		this.spinner.hide();
              		this.notificationService.showSuccess('Operación realiza exitosamente',response.message)

            	}
            }
            ).catch(error => {
              this.spinner.hide();
              if(error.error)
              this.notificationService.showError('Error',error.error) 
            });   
    }

}
