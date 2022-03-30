import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { User } from "src/app/models/user";
import { UserService } from "src/app/services/user/user.service";
import { RolService } from "src/app/services/rol/rol.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { rolConfigObj } from "./selectsconfigs/configs";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


@Component({
  selector: "app-users",
  templateUrl: "users.component.html"
})
export class UsersComponent implements OnInit, OnDestroy {
  public users:User[]=[];
  public rolConfig:any = rolConfigObj;
  public rols:any[]=[];
  public rolSelected:number=null;
  public user:User=new User();
  public modalRef:any=null;
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //sort 
  public highestToLowest: any={
    name:false,
    last_name:false,
    email:false,
    rol:false,
    status:false
  };
  //excel file
  public data: Array<any>=null;
  constructor(
    public userService:UserService,
    public rolService:RolService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService ) {
  }

  ngOnInit() {
    this.getRoles();
    this.getUsers();
  }
  /*obtiene listado de roles*/
  getRoles(){
    this.spinner.show();
    this.rolService.getAll().toPromise().then(
      response => {
        this.spinner.hide();
        this.rols=response.data;
      }
      ).catch( 
      error => {
        this.spinner.hide();
        console.log("error:",error)
      }
      );
    }
    /* obtencion de listado de usuarios */ 
    getUsers(){
      this.spinner.show();
      this.userService.getAll().toPromise().then(
        response => {
          this.spinner.hide();
          this.users=response.data;
        }
        ).catch( 
        error => {        
          this.spinner.hide();
          console.log("error:",error)
        }
        );    
      }
      /*abre modal*/
      open(content) {
        this.setDefaultValues();
        this.modalRef=this.modalService.open(content);
      }
      /* registra o actualiza elemento */ 
      register(){
        if(this.user.id){
          this.spinner.show();
          this.userService.updateElement(this.user.id, this.user).toPromise().then(
            response => {
              this.spinner.hide();
              this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
              this.modalRef.close();
              this.users=this.users.map(element=>{
                return element.id==response.data.id?response.data:element;
              })
              this.user=new User();
            }
            ).catch(
            error => {
              this.spinner.hide();
              if(error.error)
              this.notificationService.showError('Error',error.error) 
            }
            );      
          } 
          else{
            this.spinner.show();
            this.userService.create(this.user).toPromise().then(
              response => {
                this.spinner.hide();
                this.users.push(response.user)
                this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                this.modalRef.close();
                this.user=new User();
              }
              ).catch(
              error => {
                this.spinner.hide();
                if(error.error)
                this.notificationService.showError('Error',error.error)
                console.log("error:",error)   
              }
              );
            }
          }
          /* eliminacion de elemento por id */ 
          delete(id:number){
          this.user=this.users.find(element=>{
            return element.id==id?element:null
          })
            Swal.fire({
              title: 'Confirmar operación',
              text: '¿Desea eliminar el usuario "'+this.user.name+'"?',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'No, Cancelar'
            }).then((result) => {
              if (result.value) {
                this.spinner.show();
                this.userService.deleteElement(id).toPromise().then(
                  response => {
                    this.spinner.hide();
                    this.users=this.users.filter(element=>{
                      if(element.id!=response.data.id){
                        return element
                      }
                    })
                    this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                  }
                  ).catch(
                  error => {
                    this.spinner.hide();
                    if(error.error)
                    this.notificationService.showError('Error',error.error)
                    console.log("error:",error)   
                  }
                  );
                }
                this.setDefaultValues();
              })

          }
          /*edita usuario*/
          edit(user:User,content:any){
            this.user=Object.assign({},user);
            this.rolSelected=this.rols.find(element=>{
              return element.id==this.user.id_rol;
            });
            this.modalRef=this.modalService.open(content);
          }
          /* detector de cambio cambio en select */ 
          selectionChanged(event){
            this.user.id_rol=event.value?event.value.id:null;
          }
          /* carga de valores por defecto */ 
          setDefaultValues(){
            this.user=new User(); 
            this.rolSelected=null;
          }
          /*cierra modal*/
          closeModal(){
            this.modalRef.close();
          }
          /*ordenado de listado por orden alfabetico*/ 
          sortTableBy(element:string){
            switch (element) {
              case "name":
                  if(this.highestToLowest.name){
                    this.users=this.users.sort((a, b) => {
                      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                      return 0;
                    });
                  }else{
                    this.users=this.users.sort((a, b) => {
                      if (b.name.toLowerCase() > a.name.toLowerCase()) return 1;
                      if (b.name.toLowerCase() < a.name.toLowerCase()) return -1;
                      return 0;
                    });
                  }
                  this.highestToLowest.name=!this.highestToLowest.name;
                break;
              case "last_name":
                  if(this.highestToLowest.last_name){
                    this.users=this.users.sort((a, b) => {
                      if (a.last_name.toLowerCase() > b.last_name.toLowerCase()) return 1;
                      if (a.last_name.toLowerCase() < b.last_name.toLowerCase()) return -1;
                      return 0;
                    });
                  }else{
                    this.users=this.users.sort((a, b) => {
                      if (b.last_name.toLowerCase() > a.last_name.toLowerCase()) return 1;
                      if (b.last_name.toLowerCase() < a.last_name.toLowerCase()) return -1;
                      return 0;
                    });
                  }
                  this.highestToLowest.last_name=!this.highestToLowest.last_name;
                break;
              case "email":
                  if(this.highestToLowest.email){
                    this.users=this.users.sort((a, b) => {
                      if (a.email.toLowerCase() > b.email.toLowerCase()) return 1;
                      if (a.email.toLowerCase() < b.email.toLowerCase()) return -1;
                      return 0;
                    });
                  }else{
                    this.users=this.users.sort((a, b) => {
                      if (b.email.toLowerCase() > a.email.toLowerCase()) return 1;
                      if (b.email.toLowerCase() < a.email.toLowerCase()) return -1;
                      return 0;
                    });
                  }
                  this.highestToLowest.email=!this.highestToLowest.email;
                break;
              case "rol":
                  if(this.highestToLowest.rol){
                    this.users=this.users.sort((a, b) => {
                      if (a.rol.name.toLowerCase() > b.rol.name.toLowerCase()) return 1;
                      if (a.rol.name.toLowerCase() < b.rol.name.toLowerCase()) return -1;
                      return 0;
                    });
                  }else{
                    this.users=this.users.sort((a, b) => {
                      if (b.rol.name.toLowerCase() > a.rol.name.toLowerCase()) return 1;
                      if (b.rol.name.toLowerCase() < a.rol.name.toLowerCase()) return -1;
                      return 0;
                    });
                  }
                  this.highestToLowest.rol=!this.highestToLowest.rol;
                break;
              case "status":
                  if(this.highestToLowest.status){
                    this.users=this.users.sort((a, b) => {
                      if (a.status.name.toLowerCase() > b.status.name.toLowerCase()) return 1;
                      if (a.status.name.toLowerCase() < b.status.name.toLowerCase()) return -1;
                      return 0;
                    });
                  }else{
                    this.users=this.users.sort((a, b) => {
                      if (b.status.name.toLowerCase() > a.status.name.toLowerCase()) return 1;
                      if (b.status.name.toLowerCase() < a.status.name.toLowerCase()) return -1;
                      return 0;
                    });
                  }
                  this.highestToLowest.status=!this.highestToLowest.status;
                break;
              default:
                // code...
                break;
            }
          }
          /* generacion de reporte en excel */
          generateReport(){
             this.data=new Array();
             for(let user of this.users){
                this.data.push({
                  name: user.name,
                  last_name: user.last_name,
                  email: user.email,
                  rol:user.rol?user.rol.name:'Sin rol',
                  status:user.status?user.status.name:'Sin status',
                });
             }     
            this.exportAsExcelFile(this.data, 'listado-users');
                
          }
          /* exporta como archivo excel*/
          exportAsExcelFile(json: any[], excelFileName: string): void {
            const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
            const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, excelFileName);
          }
          /*guardar como archivo excel*/
          private saveAsExcelFile(buffer: any, fileName: string): void {
             const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
             FileSaver.saveAs(data, fileName +new  Date()+EXCEL_EXTENSION);
          }
          ngOnDestroy() {
          }

        }
