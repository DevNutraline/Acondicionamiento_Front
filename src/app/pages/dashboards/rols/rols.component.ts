import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { Rol } from "src/app/models/rol";
import { Permission } from "src/app/models/permission";
import { RolService } from "src/app/services/rol/rol.service";
import { PermissionService } from "src/app/services/permission/permission.service";
import { NotificationService } from "src/app/services/notification/notification.service";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "app-rols",
  templateUrl: "rols.component.html"
})
export class RolsComponent implements OnInit, OnDestroy {  
  public modalRef:any=null;
  public rols:Rol[]=[];
  public rol:Rol=null;
  public permissions:Permission[]=[];
  public permissionsSelected:any[]=[];
  public rolePermissions:any[]=[];
  public checkboxes: any[]=[];
  public userLS:any=null;
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //sort 
  public highestToLowest: any={
    name:false,
    descriptions:false,
  };
  //excel file
  public data: Array<any>=null;
  constructor(
    public rolService: RolService,
    public permissionService:PermissionService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService ) {
  }

  ngOnInit() {
    this.setDefaultValues();
    this.getPermissions();
    this.getRols();    
    this.getUser();
  }
  /*obtiene usuario en sesión desde localStorage*/
  getUser(){    
    this.userLS=JSON.parse(localStorage.getItem("user"));
  }
  /* obtencion de listado de permisos */ 
  getPermissions(){
    this.spinner.show();
    this.permissionService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.permissions=response.data;
          this.checkboxes = this.permissions.map(element=>{
            return {id:element.id,name:element.name,descriptions:element.descriptions,checked:false}
          });
        }
      }
      ).catch( 
      error => {
        this.spinner.hide();
        console.log("error:",error)
      }
      );
    }
    /* obtencion de listado de roles */ 
    getRols(){
      this.spinner.show();
      this.rolService.getAll().toPromise().then(
        response => {
          if(response!=undefined && response.data){
            this.spinner.hide();
            this.rols=response.data;
          }
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
        if(this.rol.id){
          this.spinner.show();
          this.rolService.updateElement(this.rol.id,this.rol).toPromise().then(
            response => {
              if(response!=undefined && response.data){
                this.rols=this.rols.map(element=>{
                  return element.id==response.data.id?response.data:element;
                })
                this.spinner.hide();
                this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                this.modalRef.close();  
                this.setDefaultValues();              
              }
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
            this.rolService.create(this.rol).toPromise().then(
              response => {
                if(response!=undefined && response.data){
                  this.rols=this.rols.map(element=>{
                    return element.id==response.data.id?response.data:element;
                  })
                  this.spinner.hide();
                  this.rols.push(response.data)
                  this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                  this.modalRef.close();
                  this.setDefaultValues();
                }
              }).catch(
              error => {
                this.spinner.hide();
                if(error.error)
                this.notificationService.showError('Error',error.error)
                console.log("error:",error)   
              });
            }
          }
          /* eliminacion de elemento por id */ 
          delete(id:number){
            this.rol=this.rols.find(element=>{
              return element.id==id?element:null
            })
            Swal.fire({
              title: 'Confirmar operación',
              text: '¿Desea eliminar el rol "'+this.rol.name+'"?',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'No, Cancelar'
            }).then((result) => {
              if (result.value) {
                this.spinner.show();
                this.rolService.deleteElement(id).toPromise().then(
                  response => {
                    if(response!=undefined && response.data){
                      this.spinner.hide();
                      this.rols=this.rols.filter(element=>{
                        if(element.id!=response.data.id){
                          return element
                        }
                      })
                      this.notificationService.showSuccess('Operación realiza exitosamente',response.message)                    
                     }
                  }).catch(
                  error => {
                    this.spinner.hide();
                    if(error.error)
                    this.notificationService.showError('Error',error.error)
                    console.log("error:",error)   
                  });
                }

                this.setDefaultValues();
              })

          }
          /*edicion de elemento*/
          edit(rol:Rol,content:any){
            this.rol=Object.assign({},rol);
            this.modalRef=this.modalService.open(content);
          }
          /* carga de valores por defecto */ 
          setDefaultValues(){
            this.rol=new Rol();
            this.checkboxes = this.permissions.map(element=>{
              return {id:element.id,name:element.name,descriptions:element.descriptions,checked:false}
            });
          }

          /*ordenado de listado por orden alfabetico*/ 
          sortTableBy(element:string){
            switch (element) {
              case "name":
              if(this.highestToLowest.name){
                this.rols=this.rols.sort((a, b) => {
                  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.rols=this.rols.sort((a, b) => {
                  if (b.name.toLowerCase() > a.name.toLowerCase()) return 1;
                  if (b.name.toLowerCase() < a.name.toLowerCase()) return -1;
                  return 0;
                });
              }
              this.highestToLowest.name=!this.highestToLowest.name;
              break;
              case "descriptions":
              if(this.highestToLowest.descriptions){
                this.rols=this.rols.sort((a, b) => {
                  if (a.descriptions.toLowerCase() > b.descriptions.toLowerCase()) return 1;
                  if (a.descriptions.toLowerCase() < b.descriptions.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.rols=this.rols.sort((a, b) => {
                  if (b.descriptions.toLowerCase() > a.descriptions.toLowerCase()) return 1;
                  if (b.descriptions.toLowerCase() < a.descriptions.toLowerCase()) return -1;
                  return 0;
                });
              }
              this.highestToLowest.descriptions=!this.highestToLowest.descriptions;
              break;
              default:
              // code...
              break;
            }
          }
          /*asignacion de permisos*/
          assignPermission(id:number,content:any){
            this.rol=this.rols.find(element=>{
              return element.id==id?element:null
            })
            for (let cb of this.checkboxes) {
              if(this.rol.role_permissions.find(element=>{
                return element.id_permission==cb.id
              })){
                cb.checked=true;
              }
            }
            this.modalRef=this.modalService.open(content);
          }
          /*seleccion en checkbox*/
          toggleSelection(event, i) {
            this.checkboxes[i].checked=!this.checkboxes[i].checked;
            this.permissionsSelected=this.checkboxes.map(element=>{
              return element.checked?element.id:null;
            })
          }
          /*añadiendo permisos*/
          addPermissions(){
            this.spinner.show();
            this.rolService.addPermissions(this.rol.id,{
              userId:this.userLS.user.id,
              permissionsSelected:this.permissionsSelected
            }).toPromise().then(
              response => {
                if(response!=undefined && response.data){
                  this.rols=this.rols.map(element=>{
                    return element.id==response.data.rol.id?response.data.rol:element;
                  })
                  this.userLS.user=response.data.user;
                  localStorage.setItem('user', JSON.stringify(this.userLS));
                  this.spinner.hide();
                  this.notificationService.showSuccess('Operación realiza exitosamente',response.message)                    
                  this.modalRef.close();
                }
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
            /*cerrar modal de permisos*/
            closePermissionsModal(){
              this.modalRef.close();
              this.setDefaultValues();
            }
            /*muestra permisos de rol*/
            showRolePermissions(rolePermissions:any[]){
              this.rolePermissions=rolePermissions;
              if(this.rolePermissions.length>0){
                this.rol=this.rols.find(element=>{
                  return element.id==rolePermissions[0].id_role?element:null
                });                
              }
            }
            /*cierra tabla de permisos de rol*/
            closeRolePermissionsTable(){
              this.rolePermissions=[]
              this.rol=new Rol();
            }
            /*generacion de reporte en excel*/
          generateReport(){
             this.data=new Array();
             for(let rol of this.rols){
                this.data.push({
                  name:rol.name,
                  descriptions:rol.descriptions,
                  quantity_permissions:rol.role_permissions.length
                });
             }     
            this.exportAsExcelFile(this.data, 'listado-rols');
          }
          /*exporta archivo excel*/
          exportAsExcelFile(json: any[], excelFileName: string): void {
            const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
            const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.saveAsExcelFile(excelBuffer, excelFileName);
          }
          /* guarda como archivo excel*/
          private saveAsExcelFile(buffer: any, fileName: string): void {
             const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
             FileSaver.saveAs(data, fileName +new  Date()+EXCEL_EXTENSION);
          }
            //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            ngOnDestroy() {
            }

          }
