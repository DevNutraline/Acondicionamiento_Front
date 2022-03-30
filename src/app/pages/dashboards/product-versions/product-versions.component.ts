import { Component, OnInit, OnDestroy } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { VersionProduct } from "src/app/models/version-product";
import { VersionProductService } from "src/app/services/version-product/version-product.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import * as moment from "moment";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "app-product-versions",
  templateUrl: "product-versions.component.html"
})
export class ProductVersionsComponent implements OnInit, OnDestroy {  
  public modalRef:any=null;
  public versionProducts:VersionProduct[] = [];
  public versionProduct:VersionProduct=null;
  //sort 
  public highestToLowest: any={
    name:false,
    descriptions:false,
    cod_sap:false,
  };
  //detalle de imagen
  public versionProductImagen:string=null;
  public name:string=null;
  //excel file
  public data: Array<any>=null;
  //paginacion
  public p:number=1;
  //buscador 
  public searchTable: string=null;
  constructor(
    public versionProductService: VersionProductService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public spinner: NgxSpinnerService,
    public router: Router ) {
  }
  ngOnInit() {
    this.setDefaultValues();
    this.getProductTypeOVAs();
  } 
  /*obtencion listado productos tipo ova*/ 
  getProductTypeOVAs(){
    this.spinner.show();
    this.versionProductService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.versionProducts=response.data;
        }
      }
      ).catch( 
      error => {        
        this.spinner.hide();
        console.log("error:",error)
      }
      );
    }
    /*navegacion*/
    goToForm(id?:number){
      if (id) {
        this.router.navigate(["dashboards/product-version-form/version",id]);
      }else{
        this.router.navigate(["dashboards/product-version-form"]);
      }
    }
        /* eliminacion de elemento por id */ 
        delete(id:number){
          this.versionProduct=this.versionProducts.find(element=>{
            return element.id==id?element:null
          })
            Swal.fire({
              title: 'Confirmar operación',
              text: '¿Desea eliminar la versión de producto "'+this.versionProduct.name+'"?',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'No, Cancelar'
            }).then((result) => {
              if (result.value) {
                this.spinner.show();
                this.versionProductService.deleteElement(id).toPromise().then(
                  response => {
                    if(response!=undefined && response.data){
                      this.spinner.hide();
                      this.versionProducts=this.versionProducts.filter(element=>{
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
          /* carga de valores por defecto */ 
          setDefaultValues(){
            this.versionProduct=new VersionProduct();
          }
         /*ordenado de listado por orden alfabetico*/ 
         sortTableBy(element:string){
            switch (element) {
              case "name":
                  if(this.highestToLowest.name){
                    this.versionProducts=this.versionProducts.sort((a, b) => {
                      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                      return 0;
                    });
                  }else{
                    this.versionProducts=this.versionProducts.sort((a, b) => {
                      if (b.name.toLowerCase() > a.name.toLowerCase()) return 1;
                      if (b.name.toLowerCase() < a.name.toLowerCase()) return -1;
                      return 0;
                    });
                  }
                  this.highestToLowest.name=!this.highestToLowest.name;
                break;
              case "descriptions":
                  if(this.highestToLowest.descriptions){
                    this.versionProducts=this.versionProducts.sort((a, b) => {
                      if (a.product.descriptions.toLowerCase() > b.product.descriptions.toLowerCase()) return 1;
                      if (a.product.descriptions.toLowerCase() < b.product.descriptions.toLowerCase()) return -1;
                      return 0;
                    });
                  }else{
                    this.versionProducts=this.versionProducts.sort((a, b) => {
                      if (b.product.descriptions.toLowerCase() > a.product.descriptions.toLowerCase()) return 1;
                      if (b.product.descriptions.toLowerCase() < a.product.descriptions.toLowerCase()) return -1;
                      return 0;
                    });
                  }
                  this.highestToLowest.descriptions=!this.highestToLowest.descriptions;
                break;
              case "cod_sap":
                  if(this.highestToLowest.cod_sap){
                    this.versionProducts=this.versionProducts.sort((a, b) => {
                      if (a.product.cod_sap.toLowerCase() > b.product.cod_sap.toLowerCase()) return 1;
                      if (a.product.cod_sap.toLowerCase() < b.product.cod_sap.toLowerCase()) return -1;
                      return 0;
                    });
                  }else{
                    this.versionProducts=this.versionProducts.sort((a, b) => {
                      if (b.product.cod_sap.toLowerCase() > a.product.cod_sap.toLowerCase()) return 1;
                      if (b.product.cod_sap.toLowerCase() < a.product.cod_sap.toLowerCase()) return -1;
                      return 0;
                    });
                  }
                  this.highestToLowest.cod_sap=!this.highestToLowest.cod_sap;
                break;
              default:
                // code...
                break;
            }
          }
          /*abre modal de imagen*/
      openImage(content:any,image:string,name:string){
        this.versionProductImagen=image;
        this.name=name;
        this.modalRef=this.modalService.open(content);
      }
        /*generacion de reporte en excel*/
        generateReport(){
          this.data=new Array();
          for(let versionProduct of this.versionProducts){
            this.data.push({
              cod_sap: versionProduct.product.cod_sap,
              name: versionProduct.name?versionProduct.name:'Sin nombre registrado',
              descriptions: versionProduct.product.descriptions,
            });
          }     
          this.exportAsExcelFile(this.data, 'listado-product-versions');
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
