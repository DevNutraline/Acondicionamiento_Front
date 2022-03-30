import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { Recipient } from "src/app/models/recipient";
import { RecipientsService } from "src/app/services/recipients/recipients.service";
import { NotificationService } from "src/app/services/notification/notification.service";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: "app-recipients",
  templateUrl: "recipients.component.html",
  styleUrls: ["./recipients.component.scss"]
})
export class RecipientsComponent implements OnInit, OnDestroy {  
  public modalRef:any=null;
  public recipients:Recipient[]=[];
  public recipient:Recipient=null;
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //sort 
  public highestToLowest: any={
    name:false,
    last_name:false,
    email:false,
    inventariado:false,
    ova:false,
    product:false,
  };
  //excel file
  public data: Array<any>=null;
  constructor(
    public recipientsService: RecipientsService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService ) {
  }

  ngOnInit() {
    this.setDefaultValues();
    this.getRecipients();
  }
  /*obtiene lista de destinatarios*/
  getRecipients(){
    this.spinner.show();
    this.recipientsService.getAll().toPromise().then(
      response => {
        this.spinner.hide();
        this.recipients=response.data;
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
    radioCheck(element:string,value:number){
      switch (element) {
        case "inventario":
        this.recipient.inventario=value;
        break;
        case "ova":
        this.recipient.ova=value;
        break;
        case "product":
        this.recipient.product=value;
        break;
        default:
        // code...
        break;
      }
    }
    /* registra o actualiza elemento */ 
    register(){
      if(this.recipient.id){
        this.spinner.show();
        this.recipientsService.updateElement(this.recipient.id,this.recipient).toPromise().then(
          response => {
            this.recipients=this.recipients.map(element=>{
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
          this.recipientsService.create(this.recipient).toPromise().then(
            response => {
              this.recipients=this.recipients.map(element=>{
                return element.id==response.data.id?response.data:element;
              })
              this.spinner.hide();
              this.recipients.push(response.data)
              this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
              this.modalRef.close();
              this.setDefaultValues();
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
            Swal.fire({
              title: 'Confirmar operación',
              text: '¿Desea eliminar el elemento?',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'No, Cancelar'
            }).then((result) => {
              if (result.value) {
                this.spinner.show();
                this.recipientsService.deleteElement(id).toPromise().then(
                  response => {
                    this.spinner.hide();
                    this.recipients=this.recipients.filter(element=>{
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
            })
            
          }
          /*edicion de elemento*/
          edit(recipient:Recipient,content:any){
            this.recipient=Object.assign({},recipient);
            this.modalRef=this.modalService.open(content);
          }
        /* carga de valores por defecto */ 
        setDefaultValues(){
          this.recipient=new Recipient();    
          this.recipient.inventario=1;
          this.recipient.ova=1;
          this.recipient.product=1;
        }
        /*ordenado de listado por orden alfabetico*/ 
        sortTableBy(element:string){
          switch (element) {
            case "name":
            if(this.highestToLowest.name){
              this.recipients=this.recipients.sort((a, b) => {
                if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.recipients=this.recipients.sort((a, b) => {
                if (b.name.toLowerCase() > a.name.toLowerCase()) return 1;
                if (b.name.toLowerCase() < a.name.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.name=!this.highestToLowest.name;
            break;
            case "last_name":
            if(this.highestToLowest.last_name){
              this.recipients=this.recipients.sort((a, b) => {
                if (a.last_name.toLowerCase() > b.last_name.toLowerCase()) return 1;
                if (a.last_name.toLowerCase() < b.last_name.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.recipients=this.recipients.sort((a, b) => {
                if (b.last_name.toLowerCase() > a.last_name.toLowerCase()) return 1;
                if (b.last_name.toLowerCase() < a.last_name.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.last_name=!this.highestToLowest.last_name;
            break;
            case "email":
            if(this.highestToLowest.email){
              this.recipients=this.recipients.sort((a, b) => {
                if (a.email.toLowerCase() > b.email.toLowerCase()) return 1;
                if (a.email.toLowerCase() < b.email.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.recipients=this.recipients.sort((a, b) => {
                if (b.email.toLowerCase() > a.email.toLowerCase()) return 1;
                if (b.email.toLowerCase() < a.email.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.email=!this.highestToLowest.email;
            break;
            case "inventario":
            if(this.highestToLowest.inventario){
              this.recipients=this.recipients.sort((a, b) => {
                if (a.inventario > b.inventario) return 1;
                if (a.inventario < b.inventario) return -1;
                return 0;
              });
            }else{
              this.recipients=this.recipients.sort((a, b) => {
                if (b.inventario > a.inventario) return 1;
                if (b.inventario < a.inventario) return -1;
                return 0;
              });
            }
            this.highestToLowest.inventario=!this.highestToLowest.inventario;
            break;
            case "ova":
            if(this.highestToLowest.ova){
              this.recipients=this.recipients.sort((a, b) => {
                if (a.ova > b.ova) return 1;
                if (a.ova < b.ova) return -1;
                return 0;
              });
            }else{
              this.recipients=this.recipients.sort((a, b) => {
                if (b.ova > a.ova) return 1;
                if (b.ova < a.ova) return -1;
                return 0;
              });
            }
            this.highestToLowest.ova=!this.highestToLowest.ova;
            break;
            case "product":
            if(this.highestToLowest.product){
              this.recipients=this.recipients.sort((a, b) => {
                if (a.product > b.product) return 1;
                if (a.product < b.product) return -1;
                return 0;
              });
            }else{
              this.recipients=this.recipients.sort((a, b) => {
                if (b.product > a.product) return 1;
                if (b.product < a.product) return -1;
                return 0;
              });
            }
            this.highestToLowest.product=!this.highestToLowest.product;
            break;
            default:
            // code...
            break;
          }
        }
        /*generacion de reporte en excel*/
          generateReport(){
             this.data=new Array();
             for(let recipient of this.recipients){
                this.data.push({
                  name: recipient.name,
                  last_name: recipient.last_name,
                  email: recipient.email,
                  inventario: recipient.inventario,
                  ova: recipient.ova,
                  product: recipient.product,
                });
             }     
            this.exportAsExcelFile(this.data, 'listado-destinatarios');
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
