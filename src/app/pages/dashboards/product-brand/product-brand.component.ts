import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { ProductBrand } from "src/app/models/product-brand";
import { ProductBrandService } from "src/app/services/product-brand/product-brand.service";
import { NotificationService } from "src/app/services/notification/notification.service";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: "app-product-brand",
  templateUrl: "product-brand.component.html"
})
export class ProductBrandComponent implements OnInit, OnDestroy {  
  public modalRef:any=null;
  public productBrands:ProductBrand[]=[];
  public productBrand:ProductBrand=null;
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //sort 
  public highestToLowest: any={
    name:false,
  };
  //excel file
  public data: Array<any>=null;
  constructor(
    public productBrandService: ProductBrandService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService ) {
  }

  ngOnInit() {
    this.setDefaultValues();
    this.getProductBrands();
  }
  /*obtencion de marcas de productos*/
  getProductBrands(){
    this.spinner.show();
    this.productBrandService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.productBrands=response.data;
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
      if(this.productBrand.id){
        this.spinner.show();
        this.productBrandService.updateElement(this.productBrand.id,this.productBrand).toPromise().then(
          response => {
            if(response!=undefined && response.data){              
              this.productBrands=this.productBrands.map(element=>{
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
          this.productBrandService.create(this.productBrand).toPromise().then(
            response => {
              if(response!=undefined && response.data){                
                this.productBrands=this.productBrands.map(element=>{
                  return element.id==response.data.id?response.data:element;
                })
                this.spinner.hide();
                this.productBrands.push(response.data)
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
          this.productBrand=this.productBrands.find(element=>{
            return element.id==id?element:null
          })
            Swal.fire({
              title: 'Confirmar operación',
              text: '¿Desea eliminar el grupo "'+this.productBrand.name+'"?',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'No, Cancelar'
            }).then((result) => {
              if (result.value) {
                this.spinner.show();
                this.productBrandService.deleteElement(id).toPromise().then(
                  response => {
                    if(response!=undefined && response.data){                      
                      this.spinner.hide();
                      this.productBrands=this.productBrands.filter(element=>{
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
          edit(productBrand:ProductBrand,content:any){
            this.productBrand=Object.assign({},productBrand);
            this.modalRef=this.modalService.open(content);
          }
          /* carga de valores por defecto */ 
          setDefaultValues(){
            this.productBrand=new ProductBrand();
          }
        /*ordenado de listado por orden alfabetico*/ 
        sortTableBy(element:string){
          switch (element) {
            case "name":
              if(this.highestToLowest.name){
                this.productBrands=this.productBrands.sort((a, b) => {
                  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.productBrands=this.productBrands.sort((a, b) => {
                  if (b.name.toLowerCase() > a.name.toLowerCase()) return 1;
                  if (b.name.toLowerCase() < a.name.toLowerCase()) return -1;
                  return 0;
                });
              }
              this.highestToLowest.name=!this.highestToLowest.name;
              break;            
            default:
            // code...
            break;
          }
        }
        /*generacion de reporte en excel*/
        generateReport(){
          this.data=new Array();
          for(let productBrand of this.productBrands){
            this.data.push({
              name: productBrand.name,
            });
          }     
          this.exportAsExcelFile(this.data, 'listado-product-brand');
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
