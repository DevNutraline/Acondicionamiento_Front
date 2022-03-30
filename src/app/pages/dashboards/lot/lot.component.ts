import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, TemplateRef } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from "ngx-spinner";
import {  ActivatedRoute,  Router } from "@angular/router";
import Swal from "sweetalert2";
import { Lot } from "src/app/models/lot";
import { Product } from "src/app/models/product";
import { LotService } from "src/app/services/lot/lot.service";
import { ProductService } from "src/app/services/product/product.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { productConfigObj } from "./selectsconfigs/configs";

//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "app-lot",
  templateUrl: "lot.component.html",
  styleUrls: ['./lot.component.scss']
})
export class LotComponent implements OnInit, OnDestroy{ //,AfterViewInit {
  @ViewChild('form') private formElement: TemplateRef<any>;

  public productConfig:any = productConfigObj;

  public modalRef:any=null;
  //sort 
  public highestToLowest: any={
    name:false,
    cod_sap:false,
    product:false
  };
  
  public lots:Lot[] = [];
  public lot:Lot=new Lot();
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;

  public formData = new FormData();
  //excel file
  public data: Array<any>=null;
   // Subida de imagenes
  public fileData: File = null;
  public fileDataValidator: boolean = false;
  public previewUrl: any = null;
  public fileUploadProgress: string = null;
  public uploadedFilePath: string = null;

  //detalle de imagen
  public lotImagen:string=null;

  public products:Product[]=[]
  public productSelected:Product=null;
  public selectDisabled:boolean=false;
  constructor(public modalService: NgbModal,
    public lotService: LotService,
    public productService: ProductService,
    public notificationService: NotificationService,
    public spinner: NgxSpinnerService,
    public router: Router,
    public route:ActivatedRoute ) { }

  ngOnInit() { 
    this.getProducts();  
  }
  // ngAfterViewInit(){ }
  /* obtencion de listado de productos */ 
  getProducts(){
    this.spinner.show();
    this.productService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.products=response.data;
          // if(this.route.snapshot.paramMap.get('foldercode')&&this.route.snapshot.paramMap.get('facturaid')&&this.route.snapshot.paramMap.get('productreceptionid'),this.route.snapshot.paramMap.get('productid')){
          if(this.route.snapshot.paramMap.get('productid')){
            this.productSelected=this.products.find(element=>{
              if(element.id == parseInt(this.route.snapshot.paramMap.get('productid'))) return element
            })
            this.lot.id_product=this.productSelected?this.productSelected.id:null;
            this.selectDisabled=true;
            this.modalRef=this.modalService.open(this.formElement);
          }
          this.getLots();  
        }
      }).catch( error => {
        this.spinner.hide();
        console.log("error:",error)
      });
    }
  getLots(){
    this.spinner.show();
    this.lotService.getAllWithProduct().toPromise().then(
      response => {
        if(response!=undefined && response.data){  
          this.spinner.hide();
          this.lots=response.data;
        }
      }).catch( error => {
        this.spinner.hide();
        console.log("error:",error)
      });
  }
  /* obtencion de datos de formulario */ 
    getFormData(){
      if(this.lot.name)
        this.formData.append("name", `${this.lot.name}`);
      if(this.lot.image)
        this.formData.append("image", this.lot.image);
      if(this.lot.id_product)
        this.formData.append("id_product", this.lot.id_product);
      return this.formData;
    }
  /* registra o actualiza elemento */ 
    register(){
      if(this.lot.id){
        this.spinner.show();
        this.lotService.updateElement(this.lot.id,this.getFormData()).toPromise().then(
          response => {
              if(response!=undefined && response.data){
                this.spinner.hide();
                this.lots=this.lots.map(element=>{
                  return element.id==response.data.id?response.data:element;
                })
                this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                this.modalRef.close();  
                this.setDefaultValues();
              }
          }
          ).catch(
          error => {
            this.spinner.hide();
            console.log("error:",error)
            if(error.error)
            this.notificationService.showError('Error',error.error) 
          }
          );      
        } 
        else{
          this.spinner.show();
          this.lotService.create(this.getFormData()).toPromise().then(
            response => {
              if(response!=undefined && response.data){
                this.spinner.hide();
                this.lots.push(response.data)
                this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                this.modalRef.close();
                this.setDefaultValues();

                const folderCode=this.route.snapshot.paramMap.get('foldercode');
                const facturaId=this.route.snapshot.paramMap.get('facturaid');
                const productReceptionId=this.route.snapshot.paramMap.get('productreceptionid');

                if(folderCode && facturaId && productReceptionId){
                  this.router.navigate(["dashboards/product-reception",folderCode,facturaId]);
                }
                /*if(this.route.snapshot.paramMap.get('element')&&this.route.snapshot.paramMap.get('element')=="product-reception"){
                  this.modalRef=this.modalService.open(this.formElement);
                }*/
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
  /* detector de cambio cambio en select */ 
    selectionChanged(event:any,element:string){
      switch (element) {
        case "product":
          this.lot.id_product=event.value?event.value.id:null;
          break;
        default:
        // code...
        break;
      }
    }
  /* eliminacion de elemento por id */ 
  delete(id:number){
    this.lot=this.lots.find(element=>{
            return element.id==id?element:null
          })
          Swal.fire({
            title: 'Confirmar operación',
            text: '¿Desea eliminar el lote "'+this.lot.name+'"?',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No, Cancelar'
          }).then((result) => {
            if (result.value) {
              this.spinner.show();
              this.lotService.deleteElement(id).toPromise().then(
                response => {
                  if(response!=undefined && response.data){                    
                    this.spinner.hide();
                    this.lots=this.lots.filter(element=>{
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
  edit(lot:Lot,content:any){
    this.lot=Object.assign({},lot);
    this.productSelected=this.products.find(element=> element.id==this.lot.id_product)
    this.previewUrl=this.lot.image;
    this.modalRef=this.modalService.open(content);
  }
  /*ordenado de listado por orden alfabetico*/ 
  sortTableBy(element:string){
    switch (element) {
      case "name":
        if(this.highestToLowest.name){
          this.lots=this.lots.sort((a, b) => {
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.lots=this.lots.sort((a, b) => {
            if (b.name.toLowerCase() > a.name.toLowerCase()) return 1;
            if (b.name.toLowerCase() < a.name.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.name=!this.highestToLowest.name;
      break;
      case "cod_sap":
        if(this.highestToLowest.cod_sap){
          this.lots=this.lots.sort((a, b) => {
            if (a.product.cod_sap.toLowerCase() > b.product.cod_sap.toLowerCase()) return 1;
            if (a.product.cod_sap.toLowerCase() < b.product.cod_sap.toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.lots=this.lots.sort((a, b) => {
            if (b.product.cod_sap.toLowerCase() > a.product.cod_sap.toLowerCase()) return 1;
            if (b.product.cod_sap.toLowerCase() < a.product.cod_sap.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.cod_sap=!this.highestToLowest.cod_sap;
      break;
      case "product":
        if(this.highestToLowest.product){
          this.lots=this.lots.sort((a, b) => {
            if (a.product.descriptions.toLowerCase() > b.product.descriptions.toLowerCase()) return 1;
            if (a.product.descriptions.toLowerCase() < b.product.descriptions.toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.lots=this.lots.sort((a, b) => {
            if (b.product.descriptions.toLowerCase() > a.product.descriptions.toLowerCase()) return 1;
            if (b.product.descriptions.toLowerCase() < a.product.descriptions.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.product=!this.highestToLowest.product;
      break;
      default:
      break;
    }
  }
  /*abre modal*/
    open(content) {
      this.setDefaultValues()
      this.modalRef=this.modalService.open(content);
    }
  /* carga de valores por defecto */ 
  setDefaultValues(){
    this.lot=new Lot();
    this.formData=new FormData();
    this.previewUrl=null;
    this.productSelected=null;
  }
  /*generacion de reporte en excel*/
  generateReport(){
    this.data=new Array();
    for(let lot of this.lots){
      this.data.push({
        name: lot.name,
      });
    }     
    this.exportAsExcelFile(this.data, 'listado-lotes');
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
  /*<<<<<<<<<<<<<<<<<<<<<<<MANEJO DE IMAGEN>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
        fileProgress(fileInput: any) {
          this.fileData = <File>fileInput.target.files[0];
          this.fileDataValidator = false;
          this.preview();
        }

        preview() {
          if (
            this.fileData.type.match("image/jpg") ||
            this.fileData.type.match("image/gif") ||
            this.fileData.type.match("image/png") ||
            this.fileData.type.match("image/jpeg") ||
            this.fileData.type.match("image/bmp")
            ) {
            this.lot.image=this.fileData;
          var reader = new FileReader();
          reader.readAsDataURL(this.fileData);
          reader.onload = _event => {
            this.previewUrl = reader.result;
          };
        }
      }
      /*abre modal de imagen*/
      openImage(content:any,image:string){
        this.lotImagen=image;
        this.modalRef=this.modalService.open(content);
      }
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  ngOnDestroy() {
  }
}