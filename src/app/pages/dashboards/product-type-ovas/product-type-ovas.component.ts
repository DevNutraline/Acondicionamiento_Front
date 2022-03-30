import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { ProductTypeOVA } from "src/app/models/product-type-ova";
import { ProductTypeOVAsService } from "src/app/services/product-type-ovas/product-type-ovas.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import * as moment from "moment";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "app-product-type-ovas",
  templateUrl: "product-type-ovas.component.html"
})
export class ProductTypeOVAsComponent implements OnInit, OnDestroy {  
  public modalRef:any=null;
  public productTypeOVAs:ProductTypeOVA[] = [];
  public productTypeOVA:ProductTypeOVA=null;
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
    public productTypeOVAsService: ProductTypeOVAsService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public spinner: NgxSpinnerService ) {
  }

  ngOnInit() {
    this.setDefaultValues();
    this.getProductTypeOVAs();
  } 

  /*obtencion listado productos tipo ova*/ 
  getProductTypeOVAs(){
    this.spinner.show();
    this.productTypeOVAsService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.productTypeOVAs=response.data;
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
      if(this.productTypeOVA.id){
        this.spinner.show();
        this.productTypeOVAsService.updateElement(this.productTypeOVA.id,this.productTypeOVA).toPromise().then(
          response => {
            if(response!=undefined && response.data){
              this.productTypeOVAs=this.productTypeOVAs.map(element=>{
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
          this.productTypeOVAsService.create(this.productTypeOVA).toPromise().then(
            response => {
              if(response!=undefined && response.data){
                this.productTypeOVAs=this.productTypeOVAs.map(element=>{
                  return element.id==response.data.id?response.data:element;
                })
                this.spinner.hide();
                this.productTypeOVAs.push(response.data)
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
              console.log("error:",error)   
            }
            );
          }
        }
        /* eliminacion de elemento por id */ 
        delete(id:number){
          this.productTypeOVA=this.productTypeOVAs.find(element=>{
            return element.id==id?element:null
          })
          Swal.fire({
            title: 'Confirmar operación',
            text: '¿Desea eliminar la calificación del producto "'+this.productTypeOVA.name+'"?',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No, Cancelar'
          }).then((result) => {
            if (result.value) {
              this.spinner.show();
              this.productTypeOVAsService.deleteElement(id).toPromise().then(
                response => {
                  if(response!=undefined && response.data){                    
                    this.spinner.hide();
                    this.productTypeOVAs=this.productTypeOVAs.filter(element=>{
                      if(element.id!=response.data.id){
                        return element
                      }
                    })
                    this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
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
              this.setDefaultValues();
            })
          
        }
        /*edicion de elemento*/
        edit(productTypeOVA:ProductTypeOVA,content:any){
          this.productTypeOVA=Object.assign({},productTypeOVA);
          this.modalRef=this.modalService.open(content);
        }
        /* carga de valores por defecto */ 
        setDefaultValues(){
          this.productTypeOVA=new ProductTypeOVA();
        }
        /*ordenado de listado por orden alfabetico*/ 
        sortTableBy(element:string){
          switch (element) {
            case "name":
            if(this.highestToLowest.name){
              this.productTypeOVAs=this.productTypeOVAs.sort((a, b) => {
                if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.productTypeOVAs=this.productTypeOVAs.sort((a, b) => {
                if (b.name.toLowerCase() > a.name.toLowerCase()) return 1;
                if (b.name.toLowerCase() < a.name.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.name=!this.highestToLowest.name;
            break;
            case "descriptions":
            if(this.highestToLowest.descriptions){
              this.productTypeOVAs=this.productTypeOVAs.sort((a, b) => {
                if (a.descriptions.toLowerCase() > b.descriptions.toLowerCase()) return 1;
                if (a.descriptions.toLowerCase() < b.descriptions.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.productTypeOVAs=this.productTypeOVAs.sort((a, b) => {
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
          for(let productTypeOVA of this.productTypeOVAs){
            this.data.push({
              name: productTypeOVA.name,
              descriptions: productTypeOVA.descriptions,
            });
          }     
          this.exportAsExcelFile(this.data, 'listado-product-type-ova');
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
