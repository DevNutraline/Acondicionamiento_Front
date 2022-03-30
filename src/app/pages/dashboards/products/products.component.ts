import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, TemplateRef } from "@angular/core";
import { ActivatedRoute, Router, Route } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { Product } from "src/app/models/product";
import { VersionProduct } from "src/app/models/version-product";
import { ProductBrand } from "src/app/models/product-brand";
import { Folder } from "src/app/models/folder";
import { ProductTypeOVA } from "src/app/models/product-type-ova";
import { OVAProcessType } from "src/app/models/ova-process-type";
import { ProductService } from "src/app/services/product/product.service";
import { OVAProcessTypesService } from "src/app/services/ova-process-types/ova-process-types.service";
import { ProductTypeOVAsService } from "src/app/services/product-type-ovas/product-type-ovas.service";
import { ProductBrandService } from "src/app/services/product-brand/product-brand.service";
import { FolderService } from "src/app/services/folder/folder.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { ovaProcessTypeConfigObj, productTypeOvaConfigObj,  productBrandConfigObj } from "./selectsconfigs/configs";

//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "app-products",
  templateUrl: "products.component.html",
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy { 
  @ViewChild('form')
  private formElement: TemplateRef<any>;
    
  public ovaProcessTypeConfig:any = ovaProcessTypeConfigObj;
  public ovaProcessTypes:OVAProcessType[]=[];
  public ovaProcessTypeSelected:OVAProcessType=null;

  public productTypeOvaConfig:any = productTypeOvaConfigObj;
  public productTypeOvas:ProductTypeOVA[]=[];
  public productTypeOvaSelected:ProductTypeOVA=null;

  public productBrandConfig:any = productBrandConfigObj;
  public productBrands:ProductBrand[]=[];
  public productBrandSelected:ProductBrand=null;

  public modalRef:any=null;
  public products:Product[]=[];
  public product:Product=null;
  public versionProducts:VersionProduct[] = [];
  public versionsProductSelected:VersionProduct[] = [];
  public versionProductImagen:any={name:null,src:null};
  public versionProductSelected:VersionProduct=null;

  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //sort 
  public highestToLowest: any={
    versions:false,//nombre de version de producto
    descriptions:false,
    codgf:false,
    product_brand:false,
    product_type_ova:false,
    cod_carpeta:false,
    ova_process_type:false,
    lote:false
  };

  public formData = new FormData();
  //excel file
  public data: Array<any>=null;

  constructor(
    public productService: ProductService,
    public ovaProcessTypesService: OVAProcessTypesService,
    public productTypeOVAsService: ProductTypeOVAsService,
    public productBrandService: ProductBrandService,
    public folderService: FolderService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService,
    public router: Router,
    public route:ActivatedRoute   ) {
  }

  ngOnInit() {
    this.setDefaultValues();
    this.getProductBrands();    
  }
  ngAfterViewInit() {
    this.checkParams()
  }
  /*obtencion listado de tipo de proceso ova*/ 
  getOvaProcessTypes(){
    this.ovaProcessTypesService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){  
          this.ovaProcessTypes=response.data;
          this.getProductTypeOVAs();
        }
      }).catch( error => {
        this.spinner.hide();
        console.log("error:",error)
      });
    }
  getProductBrands(){    
    this.spinner.show();
    this.productBrandService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.productBrands=response.data;
          this.getOvaProcessTypes();
        }
      }
      ).catch( 
      error => {
        this.spinner.hide();
        console.log("error:",error)
      }
      );
  }
  /*obtencion listado productos tipo ova*/ 
  getProductTypeOVAs(){
    this.productTypeOVAsService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.productTypeOvas=response.data;
          this.getProducts();
        }
      }
      ).catch( error => {
        this.spinner.hide();
        console.log("error:",error)
      });
  }
  /*verifica parametros de la url*/
  checkParams(){
    const facturaId=this.route.snapshot.paramMap.get('facturaid');
    const folderCode=this.route.snapshot.paramMap.get('foldercode');
      if(facturaId && folderCode){
        if(this.product){
          this.product.id_factura=parseInt(facturaId);
          this.product.foldercode=folderCode;          
        }
        console.log("facturaId:",facturaId)
        console.log("folderCode:",folderCode)
        console.log("formElement:",this.formElement)
        this.modalRef = this.modalService.open(this.formElement);
        console.log("modalRef:",this.modalRef)
      }
    }
  
  /* obtencion de listado de productos */ 
  getProducts(){
    this.productService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.products=response.data;
        }
      }).catch( error => {
        this.spinner.hide();
        console.log("error:",error)
      });
    }
    /*abre modal*/
    open(content) {
      this.setDefaultValues();
      this.modalRef=this.modalService.open(content);
    }

    /* detector de cambio cambio en select */ 
    selectionChanged(event:any,element:string){
      switch (element) {
        case "ova_process_type":
          this.product.id_ova_process_type=event.value?event.value.id:null;
          break;
        case "product_type_ova":
          this.product.id_ova_product_type=event.value?event.value.id:null;
          break;
        case "factura":
          this.product.id_factura=event.value?event.value.id:null;
          break;
        case "product_brand":
          this.product.id_product_brand=event.value?event.value.id:null;
          break;
        /*case "lote":
          this.product.id_lot=event.value?event.value.id:null;
          break;*/
        default:
        // code...
        break;
      }
    }
    /* obtencion de datos de formulario */ 
    getFormData(){
      if(this.product.cod_sap)
        this.formData.append("cod_sap", `${this.product.cod_sap}`);
      if(this.product.descriptions)
        this.formData.append("descriptions", `${this.product.descriptions}`);
      if(this.product.codgf)
        this.formData.append("codgf", `${this.product.codgf}`);      
      if(this.product.id_product_brand)
        this.formData.append("id_product_brand", `${this.product.id_product_brand}`);
      if(this.product.id_ova_process_type)
        this.formData.append("id_ova_process_type", `${this.product.id_ova_process_type}`);
      if(this.product.id_ova_product_type)
        this.formData.append("id_ova_product_type", `${this.product.id_ova_product_type}`);
      if(this.product.id_factura)
        this.formData.append("id_factura", `${this.product.id_factura}`);
      if(this.product.foldercode)
        this.formData.append("foldercode", `${this.product.foldercode}`);
      return this.formData;
    }
    
    /* registra o actualiza elemento */ 
    register(){
      if(this.product.id){
        this.spinner.show();
        this.productService.updateElement(this.product.id,this.getFormData()).toPromise().then(
          response => {
              if(response!=undefined && response.data){
                this.products=this.products.map(element=>{
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
            console.log("error:",error)
            if(error.error)
            this.notificationService.showError('Error',error.error) 
          }
          );      
        } 
        else{
          this.spinner.show();
          this.productService.create(this.getFormData()).toPromise().then(
            response => {
              if(response!=undefined && response.data){
                this.spinner.hide();
                this.products=this.products.map(element=>{
                  return element.id==response.data.id?response.data:element;
                })
                this.products.push(response.data)
                this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                this.modalRef.close();
                this.setDefaultValues();
                const facturaId=this.route.snapshot.paramMap.get('facturaid');
                const folderCode=this.route.snapshot.paramMap.get('foldercode');
                if(facturaId&&folderCode){
                  this.router.navigate(["dashboards/product-reception",folderCode,facturaId]);
                }
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
          this.product=this.products.find(element=>{
            return element.id==id?element:null
          })
          Swal.fire({
            title: 'Confirmar operación',
            text: '¿Desea eliminar el producto "'+this.product.descriptions+'"?',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No, Cancelar'
          }).then((result) => {
            if (result.value) {
              this.spinner.show();
              this.productService.deleteElement(id).toPromise().then(
                response => {
                  if(response!=undefined && response.data){                    
                    this.spinner.hide();
                    this.products=this.products.filter(element=>{
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
        edit(product:Product,content:any){
          this.product=Object.assign({},product);

            this.ovaProcessTypeSelected=this.ovaProcessTypes.find(element=>{
              return element.id==this.product.id_ova_process_type;
            });

            this.productTypeOvaSelected=this.productTypeOvas.find(element=>{
              return element.id==this.product.id_ova_product_type;
            });
            this.productBrandSelected=this.productBrands.find(element=>{
              return element.id==this.product.id_product_brand;
            });
            
          this.modalRef=this.modalService.open(content);
        }
        /* carga de valores por defecto */ 
        setDefaultValues(){
          this.product=new Product();
          this.formData=new FormData();
          this.ovaProcessTypeSelected=null;
          this.productTypeOvaSelected=null;
          this.productBrandSelected=null;
        }
        goToForm(element?:string,id?:number){
          if (element && id) {
            this.router.navigate([element,id]);
          }else{
            this.router.navigate(["dashboards/product-version-form"]);
          }
        }
        /*ordenado de listado por orden alfabetico*/ 
        sortTableBy(element:string){
          switch (element) {
            case "cod_sap":
            if(this.highestToLowest.cod_sap){
              this.products=this.products.sort((a, b) => {
                if (a.cod_sap.toLowerCase() > b.cod_sap.toLowerCase()) return 1;
                if (a.cod_sap.toLowerCase() < b.cod_sap.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.products=this.products.sort((a, b) => {
                if (b.cod_sap.toLowerCase() > a.cod_sap.toLowerCase()) return 1;
                if (b.cod_sap.toLowerCase() < a.cod_sap.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.cod_sap=!this.highestToLowest.cod_sap;
            break;
            case "descriptions":
            if(this.highestToLowest.descriptions){
              this.products=this.products.sort((a, b) => {
                if (a.descriptions.toLowerCase() > b.descriptions.toLowerCase()) return 1;
                if (a.descriptions.toLowerCase() < b.descriptions.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.products=this.products.sort((a, b) => {
                if (b.descriptions.toLowerCase() > a.descriptions.toLowerCase()) return 1;
                if (b.descriptions.toLowerCase() < a.descriptions.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.descriptions=!this.highestToLowest.descriptions;
            break;
            case "codgf":
            if(this.highestToLowest.codgf){
              this.products=this.products.sort((a, b) => {
                if (a.codgf.toLowerCase() > b.codgf.toLowerCase()) return 1;
                if (a.codgf.toLowerCase() < b.codgf.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.products=this.products.sort((a, b) => {
                if (b.codgf.toLowerCase() > a.codgf.toLowerCase()) return 1;
                if (b.codgf.toLowerCase() < a.codgf.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.codgf=!this.highestToLowest.codgf;
            break;
            
            case "product_type_ova":
            if(this.highestToLowest.product_type_ova){
              this.products=this.products.sort((a, b) => {
                if(a.ova_product_type && b.ova_product_type){
                  if (a.ova_product_type.name.toLowerCase() > b.ova_product_type.name.toLowerCase()) return 1;
                  if (a.ova_product_type.name.toLowerCase() < b.ova_product_type.name.toLowerCase()) return -1;
                }
                return 0;
              });
            }else{
              this.products=this.products.sort((a, b) => {
                if(a.ova_product_type && b.ova_product_type){
                  if (b.ova_product_type.name.toLowerCase() > a.ova_product_type.name.toLowerCase()) return 1;
                  if (b.ova_product_type.name.toLowerCase() < a.ova_product_type.name.toLowerCase()) return -1;
                }
                return 0;
              });
            }
            this.highestToLowest.product_type_ova=!this.highestToLowest.product_type_ova;
            break;            
            case "ova_process_type":
            if(this.highestToLowest.ova_process_type){
              this.products=this.products.sort((a, b) => {
                if(a.ova_process_type && b.ova_process_type){
                  if (a.ova_process_type.operation_type.toLowerCase() > b.ova_process_type.operation_type.toLowerCase()) return 1;
                  if (a.ova_process_type.operation_type.toLowerCase() < b.ova_process_type.operation_type.toLowerCase()) return -1;
                }
                return 0;
              });
            }else{
              this.products=this.products.sort((a, b) => {
                if(a.ova_process_type && b.ova_process_type){
                  if (b.ova_process_type.operation_type.toLowerCase() > a.ova_process_type.operation_type.toLowerCase()) return 1;
                  if (b.ova_process_type.operation_type.toLowerCase() < a.ova_process_type.operation_type.toLowerCase()) return -1;
                }
                return 0;
              });
            }
            this.highestToLowest.ova_process_type=!this.highestToLowest.ova_process_type;
            break;
            case "product_brand":
            if(this.highestToLowest.product_brand){
              this.products=this.products.sort((a, b) => {
                if (a.product_brand.name.toLowerCase() > b.product_brand.name.toLowerCase()) return 1;
                if (a.product_brand.name.toLowerCase() < b.product_brand.name.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.products=this.products.sort((a, b) => {
                if (b.product_brand.name.toLowerCase() > a.product_brand.name.toLowerCase()) return 1;
                if (b.product_brand.name.toLowerCase() < a.product_brand.name.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.product_brand=!this.highestToLowest.product_brand;
            break;
            case "versions":
            if(this.highestToLowest.versions){
              this.products=this.products.sort((a, b) => {
                if (a.versions.length > b.versions.length) return 1;
                if (a.versions.length < b.versions.length) return -1;
                return 0;
              });
            }else{
              this.products=this.products.sort((a, b) => {
                if (b.versions.length > a.versions.length) return 1;
                if (b.versions.length < a.versions.length) return -1;
                return 0;
              });
            }
            this.highestToLowest.versions=!this.highestToLowest.versions;
            break;
            /*case "lote":
            if(this.highestToLowest.lote){
              this.products=this.products.sort((a, b) => {
                if (a.lot.name.toLowerCase() > b.lot.name.toLowerCase()) return 1;
                if (a.lot.name.toLowerCase() < b.lot.name.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.products=this.products.sort((a, b) => {
                if (b.lot.name.toLowerCase() > a.lot.name.toLowerCase()) return 1;
                if (b.lot.name.toLowerCase() < a.lot.name.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.lote=!this.highestToLowest.lote;
            break;*/
            
            default:
            break;
          }
        }
        showVersions(versions:any[]){
          this.versionProducts=versions;
          if(this.versionProducts.length>0){
            this.product=this.products.find(element=>{
              return element.id==this.versionProducts[0].id_product?element:null
            })
          }
        }
        closeVesionProductTable(){
          this.versionProducts=[]
          this.product=new Product();
        }
        condition(product:Product,content:any){
          if(!product.id_ova_process_type){
            this.notificationService.showError('Error',{error:"No se puede acondicionar porque falta cargar el proceso ova"})
          }
          if(!product.id_ova_product_type){
            this.notificationService.showError('Error',{error:"No se puede acondicionar porque falta cargar el producto ova"})
          }
          if(product.id_ova_process_type && product.id_ova_product_type){
            const versions:any[]=product.versions;
            if(versions.length>1){
              this.versionsProductSelected=versions;
              this.modalRef=this.modalService.open(content);
            }else{
              this.navigateTo(['dashboards/directriz',versions[0].id])
            }
          }
        }
        /*navegacion por ruta*/ 
        navigateTo(route:any[]){          
          this.router.navigate(route);
        }
        openImage(content:any,image:string,name:string){
          this.versionProductImagen.src=image;
          this.versionProductImagen.name=name;
          this.modalRef=this.modalService.open(content);
        }
        /*generacion de reporte en excel*/
        generateReport(){
          this.data=new Array();
          for(let product of this.products){
              this.data.push({
                product_brand_name: product.product_brand.name,
                ova_product_type: product.ova_product_type?product.ova_product_type.name:'Sin producto tipo OVA registrado',
                factura: product.factura?product.factura.folioNum:'Sin factura registrada',
                ova_process_type: product.ova_process_type?product.ova_process_type.operation_type:'Sin proceso tipo OVA registrado',
                lote: null
              });             
          }     
          this.exportAsExcelFile(this.data, 'listado-products');
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
