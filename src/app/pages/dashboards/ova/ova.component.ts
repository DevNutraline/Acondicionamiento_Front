import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { ProductReception } from "src/app/models/product-reception";
import { Folder } from "src/app/models/folder";
import { Factura } from "src/app/models/factura";
import { FolderService } from "src/app/services/folder/folder.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import * as moment from "moment";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


@Component({
  selector: "app-ova",
  templateUrl: "ova.component.html"
})
export class OvaComponent implements OnInit, OnDestroy {
  public modalRef:any=null;

  public folderSelected:Folder=null;
  public folders:Folder[]=[];
  public facturasSelected:Factura[]=[];
  public facturaSelected:Factura=null;
  public searchTableFactura:string=null;

  public productsReceptionSelected:ProductReception[]=[];
  //sort 
  public highestToLowest: any={
    cod_carpeta:false,
    /*type:false,
    status:false,
    created_at:false,
    closed_at:false,*/
  };
  //paginacion
  public pFactura: number = 1;
  public pFolder:number=1;
  //buscador 
  public searchTable: string=null;
  //excel file
  public data: Array<any>=null;

  public formData = new FormData();

  constructor(
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public folderService:FolderService,
    public spinner: NgxSpinnerService,
    public router: Router, ) {
  }

  ngOnInit() {
    this.getFolders();
    this.setDefaultValues();
  } 
  getFolders(){
    this.spinner.show();
    this.folderService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.folders=response.data;
          this.folders=this.folders.map(element=>{
            element.ova_start_estimated_date=element.ova_start_estimated_date?moment.utc(element.ova_start_estimated_date).format("YYYY-MM-DD"):null
            element.ova_end_estimated_date=element.ova_end_estimated_date?moment.utc(element.ova_end_estimated_date).format("YYYY-MM-DD"):null
            return element;
          })
        }
      }).catch( 
      error => {
        this.spinner.hide();
        console.log("error:",error)
      });
    }
    /*navegacion por ruta*/ 
    navigateTo(route:any[]){
      this.router.navigate(route);
    }
    /*ordenado de listado por orden alfabetico*/ 
    sortTableBy(element:string){
      switch (element) {
        case "cod_carpeta":
        if(this.highestToLowest.cod_carpeta){
          this.folders=this.folders.sort((a, b) => {
            if (a.cod_carpeta.toLowerCase() > b.cod_carpeta.toLowerCase()) return 1;
            if (a.cod_carpeta.toLowerCase() < b.cod_carpeta.toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.folders=this.folders.sort((a, b) => {
            if (b.cod_carpeta.toLowerCase() > a.cod_carpeta.toLowerCase()) return 1;
            if (b.cod_carpeta.toLowerCase() < a.cod_carpeta.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.cod_carpeta=!this.highestToLowest.cod_carpeta;
        break;
        /*case "type":
        if(this.highestToLowest.type){
          this.folders=this.folders.sort((a, b) => {
            if (a.type.toLowerCase() > b.type.toLowerCase()) return 1;
            if (a.type.toLowerCase() < b.type.toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.folders=this.folders.sort((a, b) => {
            if (b.type.toLowerCase() > a.type.toLowerCase()) return 1;
            if (b.type.toLowerCase() < a.type.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.type=!this.highestToLowest.type;
        break;
        case "status":
        if(this.highestToLowest.status){
          this.folders=this.folders.sort((a, b) => {
            if (a.status.toLowerCase() > b.status.toLowerCase()) return 1;
            if (a.status.toLowerCase() < b.status.toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.folders=this.folders.sort((a, b) => {
            if (b.status.toLowerCase() > a.status.toLowerCase()) return 1;
            if (b.status.toLowerCase() < a.status.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.status=!this.highestToLowest.status;
        break;
        case "created_at":
        if(this.highestToLowest.created_at){
          this.folders=this.folders.sort((a, b) => {
            if (a.created_at.toString().toLowerCase() > b.created_at.toString().toLowerCase()) return 1;
            if (a.created_at.toString().toLowerCase() < b.created_at.toString().toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.folders=this.folders.sort((a, b) => {
            if (b.created_at.toString().toLowerCase() > a.created_at.toString().toLowerCase()) return 1;
            if (b.created_at.toString().toLowerCase() < a.created_at.toString().toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.created_at=!this.highestToLowest.created_at;
        break;*/
        default:
        // code...
        break;
      }
    }
    /*obtencion de formato de fecha*/ 
    formatDate(date:any){
      return moment.utc(date).format("YYYY-MM-DD")
    }
    /*selectFolder(folder:Folder){
      this.facturasSelected=folder.facturas
      this.pFactura=1;
    }*/
    paginationChange($event:any,element:string){
      switch (element) {
        case "folder":
        this.pFolder=$event;
        return $event;
        // code...
        break;
        case "factura":
        this.pFactura=$event;
        return $event;
        // code...
        break;
        default:
        // code...
        break;
      }
    }
    closeInvoices(){
      this.facturasSelected=[];
    }
    /*generacion de reporte en excel*/
    generateReport(){
      this.data=new Array();
      for(let factura of this.facturasSelected){
        this.data.push({
          folio_num: factura.folioNum,
          doc_date: factura.docDate,
          card_code: factura.cardCode,
          card_name: factura.cardName,
        });
      }     
      this.exportAsExcelFile(this.data, 'listado-facturas');
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
    /* obtencion de datos de formulario */ 
    getFormData(){
      this.formData.append("cod_carpeta", `${this.folderSelected.cod_carpeta}`); 
      return this.formData;
    }
    /* carga de valores por defecto */ 
    setDefaultValues(){
      this.formData=new FormData();
      this.folderSelected=null;
    }
    showFolderForm(folder:any,content:any){
      this.folderSelected=Object.assign({},folder);
      if(this.folderSelected){
        this.modalRef=this.modalService.open(content,{size: 'lg'});
      }
    }
    /*cierra el modal del formulario*/
    closeFormModal(){
      this.modalRef.close();
      this.setDefaultValues();
    }
    updateFolder(){
      if(this.folderSelected.id){
        this.spinner.show();
        this.folderService.updateElement(this.folderSelected.id,this.getFormData()).toPromise().then(
          response => {
            if(response!=undefined && response.data){
              this.folders=this.folders.map(element=>{
                return element.id==response.data.id?response.data:element;
              })
              this.spinner.hide();
              this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
              this.modalRef.close();  
              this.setDefaultValues();

            }
          }
          ).catch(error => {
            console.log("error:",error)
            this.spinner.hide();
            if(error.error)
              this.notificationService.showError('Error',error.error) 
          }
          );
        } 
      }
  processEstimatedDate(id:number,type:string,value:any){
    if(value){
      this.spinner.show();
      this.folderService.processEstimatedDate(id,{
          date:moment.utc(value).format("YYYY-MM-DDTHH:mm:ss.SSS"),
          type:type
        }).toPromise().then(response => {
          if(response!=undefined && response.data){
              this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
              this.spinner.hide();
              this.folders=this.folders.map(element=>{
                response.data.ova_start_estimated_date=response.data.ova_start_estimated_date?moment.utc(response.data.ova_start_estimated_date).format("YYYY-MM-DD"):null
                response.data.ova_end_estimated_date=response.data.ova_end_estimated_date?moment.utc(response.data.ova_end_estimated_date).format("YYYY-MM-DD"):null
                return element.id==response.data.id?response.data:element;
              })
          }
        }).catch(error => {
          console.log("error:",error)
          this.spinner.hide();
          if(error.error)
            this.notificationService.showError('Error',error.error) 
      }); 
    }
  }
  processPriority(id:number,value:any){
    if(value){
      this.spinner.show();
      this.folderService.processPriority(id,{
          priority:value
        }).toPromise().then(response => {
          if(response!=undefined && response.data){
              this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
              this.spinner.hide();
              this.folders=this.folders.map(element=>{
                return element.id==response.data.id?response.data:element;
              })
          }
        }).catch(error => {
          console.log("error:",error)
          this.spinner.hide();
          if(error.error)
            this.notificationService.showError('Error',error.error) 
      }); 
    }
  }
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  ngOnDestroy() {
  }
}