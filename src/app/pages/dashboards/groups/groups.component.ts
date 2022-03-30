import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { Group } from "src/app/models/group";
import { GroupService } from "src/app/services/group/group.service";
import { NotificationService } from "src/app/services/notification/notification.service";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "app-groups",
  templateUrl: "groups.component.html"
})
export class GroupsComponent implements OnInit, OnDestroy {  
  public modalRef:any=null;
  public groups:Group[]=[];
  public group:Group=null;
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //sort 
  public highestToLowest: any={
    descriptions:false,
  };
  //excel file
  public data: Array<any>=null;
  constructor(
    public groupService: GroupService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService ) {
  }

  ngOnInit() {
    this.setDefaultValues();
    this.getgroups();
  }
  /*obtencion de grupos*/
  getgroups(){
    this.spinner.show();
    this.groupService.getAll().toPromise().then(
      response => {
        this.spinner.hide();
        this.groups=response.data;
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
      if(this.group.id){
        this.spinner.show();
        this.groupService.updateElement(this.group.id,this.group).toPromise().then(
          response => {
            this.groups=this.groups.map(element=>{
              return element.id==response.data.id?response.data:element;
            })
            this.spinner.hide();
            this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
            this.modalRef.close();  
            this.setDefaultValues();
          }
          ).catch(
          error => {
            this.spinner.hide();
            this.notificationService.showError('Error',error.error) 
          }
          );      
        } 
        else{
          this.spinner.show();
          this.groupService.create(this.group).toPromise().then(
            response => {
              this.groups=this.groups.map(element=>{
                return element.id==response.data.id?response.data:element;
              })
              this.spinner.hide();
              this.groups.push(response.data)
              this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
              this.modalRef.close();
              this.setDefaultValues();
            }
            ).catch(
            error => {
              this.spinner.hide();
              this.notificationService.showError('Error',error.error)
              console.log("error:",error)   
            }
            );
          }
        }
        /* eliminacion de elemento por id */ 
        delete(id:number){
          this.group=this.groups.find(element=>{
            return element.id==id?element:null
          })
            Swal.fire({
              title: 'Confirmar operación',
              text: '¿Desea eliminar el grupo "'+this.group.descriptions+'"?',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'No, Cancelar'
            }).then((result) => {
              if (result.value) {
                this.spinner.show();
                this.groupService.deleteElement(id).toPromise().then(
                  response => {
                    this.spinner.hide();
                    this.groups=this.groups.filter(element=>{
                      if(element.id!=response.data.id){
                        return element
                      }
                    })
                    this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                  }
                ).catch(
                  error => {
                    this.spinner.hide();
                    this.notificationService.showError('Error',error.error)
                    console.log("error:",error)   
                  }
                );
              }
              this.setDefaultValues();              
            })
            
          }

          /*edicion de elemento*/
          edit(group:Group,content:any){
            this.group=Object.assign({},group);
            this.modalRef=this.modalService.open(content);
          }
        /* carga de valores por defecto */ 
        setDefaultValues(){
          this.group=new Group();
        }
        /*ordenado de listado por orden alfabetico*/ 
        sortTableBy(element:string){
          switch (element) {
            case "descriptions":
              if(this.highestToLowest.descriptions){
                this.groups=this.groups.sort((a, b) => {
                  if (a.descriptions.toLowerCase() > b.descriptions.toLowerCase()) return 1;
                  if (a.descriptions.toLowerCase() < b.descriptions.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.groups=this.groups.sort((a, b) => {
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
        /*generacion de reporte en excel*/
        generateReport(){
          this.data=new Array();
          for(let group of this.groups){
            this.data.push({
              descriptions: group.descriptions,
            });
          }     
          this.exportAsExcelFile(this.data, 'listado-grupos');
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
