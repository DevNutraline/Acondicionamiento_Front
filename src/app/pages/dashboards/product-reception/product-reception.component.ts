import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, Route } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from "ngx-spinner";
import { FolderService } from "src/app/services/folder/folder.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { ProductReceptionService } from "src/app/services/product-reception/product-reception.service";
import { OVAProcessTypesService } from "src/app/services/ova-process-types/ova-process-types.service";
import { ProductTypeOVAsService } from "src/app/services/product-type-ovas/product-type-ovas.service";
import { OVAProcessType } from "src/app/models/ova-process-type";
import { ProductTypeOVA } from "src/app/models/product-type-ova";
import { ProductReception } from "src/app/models/product-reception";
import { Folder } from "src/app/models/folder";
import { Factura } from "src/app/models/factura";
import { VersionProduct } from "src/app/models/version-product";
import { productVersionObj, ovaProcessTypeObj, productTypeOVAObj, lotObj } from "./selectsconfigs/configs";
import * as moment from "moment";
import Swal from "sweetalert2";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "app-product-reception",
  templateUrl: "product-reception.component.html",
  styleUrls: ['./product-reception.component.scss']
})
export class ProductReceptionComponent implements OnInit, OnDestroy {
  public modalRef:any=null;

  public productVersionConfig:any = productVersionObj;

  public ovaProcessTypeConfig:any= ovaProcessTypeObj;
  public ovaProcessTypes:OVAProcessType[]=[];

  public productTypeOVAConfig:any= productTypeOVAObj;
  public productTypeOVAs:ProductTypeOVA[]=[];

  public lotConfig:any=lotObj;

  public folder:Folder=null;
  public facturas:Factura[]=[];
  public folders:Folder[]=[];
  //sort 
  public highestToLowest: any={
    doc_num:false,
    doc_date:false,
    card_code:false,
    lote:false,
  };
  public folderCode:string=null;
  //paginacion
  public pFactura: number = 1;
  public pProducto: number = 1;
  public pFolder: number = 1;  
  //buscador 
  public searchTableFactura: string=null;
  public searchTableProducto: string=null;

  public productsReceptionSelected: ProductReception[]=[];
  public facturaSelected:Factura=null;

  public productReceptionByVersion:any=[];

  public formData = new FormData();
  //excel file
  public data: Array<any>=null;  
  //buscador 
  public searchTable: string=null;

  public versionsSelected: VersionProduct[]=[];

  public searchTableVersion: string=null;

  public productReceptionByVersionSelected:any=null;
  constructor(public modalService: NgbModal,
    public folderService:FolderService,
    public productReceptionService:ProductReceptionService,
    public ovaProcessTypesService:OVAProcessTypesService,
    public productTypeOVAsService: ProductTypeOVAsService,
    public notificationService: NotificationService,
    public spinner: NgxSpinnerService,
    public router: Router,
    public route:ActivatedRoute) {
  }

  ngOnInit() { 
    this.getOvaProcessTypes();
    this.getFolders();
  } 
  /*obtencion de carpetas*/
  getFolders(){
    this.spinner.show();
    this.folderService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.folders=response.data;
        }
      }).catch( 
      error => {
        this.spinner.hide();
        console.log("error:",error)
      });
    }
  /*obtencion listado de tipo de proceso ova*/ 
  getOvaProcessTypes(){
    this.spinner.show();
    this.ovaProcessTypesService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.ovaProcessTypes=response.data;
          for (let ovaProcessType of this.ovaProcessTypes) {
            ovaProcessType['custom_pt'] = ovaProcessType.id + ' | ' + ovaProcessType.operation_type+ ' | ' + ovaProcessType.descriptions;
          }
          this.getProductTypeOVAs();
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
      this.spinner.show();
      this.productTypeOVAsService.getAll().toPromise().then(
        response => {
          if(response!=undefined && response.data){
            this.spinner.hide();
            this.productTypeOVAs=response.data;
            for (let productTypeOVA of this.productTypeOVAs) {
              productTypeOVA['custom_to'] = productTypeOVA.id + ' | ' + productTypeOVA.name + ' | ' + productTypeOVA.descriptions;
            }
            this.checkParams()
          }
        }
        ).catch( 
        error => {        
          this.spinner.hide();
          console.log("error:",error)
        }
        );
    }
    /*verifica parametros de la url*/
  checkParams(){
    const folderCode=this.route.snapshot.paramMap.get('foldercode');
    const facturaId=this.route.snapshot.paramMap.get('facturaid');
    if(folderCode && facturaId){
      this.folderCode=folderCode;
      this.searchFolderCode();
    }
  }
  /*ordenado de listado por orden alfabetico*/ 
  sortTableBy(element:string){
    switch (element) {
      case "doc_num":
      if(this.highestToLowest.doc_num){
        this.facturas=this.facturas.sort((a, b) => {
          if (a.folioNum > b.folioNum) return 1;
          if (a.folioNum < b.folioNum) return -1;
          return 0;
        });
      }else{
        this.facturas=this.facturas.sort((a, b) => {
          if (b.folioNum > a.folioNum) return 1;
          if (b.folioNum < a.folioNum) return -1;
          return 0;
        });
      }
      this.highestToLowest.doc_num=!this.highestToLowest.doc_num;
      break;
      case "doc_date":
      if(this.highestToLowest.doc_date){
        this.facturas=this.facturas.sort((a, b) => {
          if (a.docDate > b.docDate) return 1;
          if (a.docDate < b.docDate) return -1;
          return 0;
        });
      }else{
        this.facturas=this.facturas.sort((a, b) => {
          if (b.docDate > a.docDate) return 1;
          if (b.docDate < a.docDate) return -1;
          return 0;
        });
      }
      this.highestToLowest.doc_date=!this.highestToLowest.doc_date;
      break;
      case "card_code":
      if(this.highestToLowest.card_code){
        this.facturas=this.facturas.sort((a, b) => {
          if (a.cardCode.toLowerCase() > b.cardCode.toLowerCase()) return 1;
          if (a.cardCode.toLowerCase() < b.cardCode.toLowerCase()) return -1;
          return 0;
        });
      }else{
        this.facturas=this.facturas.sort((a, b) => {
          if (b.cardCode.toLowerCase() > a.cardCode.toLowerCase()) return 1;
          if (b.cardCode.toLowerCase() < a.cardCode.toLowerCase()) return -1;
          return 0;
        });
      }
      this.highestToLowest.card_code=!this.highestToLowest.card_code;
      break;
      case "card_name":
      if(this.highestToLowest.card_name){
        this.facturas=this.facturas.sort((a, b) => {
          if (a.cardName.toLowerCase() > b.cardName.toLowerCase()) return 1;
          if (a.cardName.toLowerCase() < b.cardName.toLowerCase()) return -1;
          return 0;
        });
      }else{
        this.facturas=this.facturas.sort((a, b) => {
          if (b.cardName.toLowerCase() > a.cardName.toLowerCase()) return 1;
          if (b.cardName.toLowerCase() < a.cardName.toLowerCase()) return -1;
          return 0;
        });
      }
      this.highestToLowest.card_name=!this.highestToLowest.card_name;
      break;
      default:
      // code...
      break;
    }
  }
  /*busqueda por condigo de carpeta*/
  searchFolderCode(){
    if(this.folderCode){
      this.spinner.show();
      this.productReceptionService.getByFolderCode({code:this.folderCode}).toPromise().then(
        response => {
          if(response!=undefined && response.data){
            this.spinner.hide();
            this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
            console.log("response:",response)
            this.folder=<Folder> response.data;
            this.facturas=response.data.facturas;
            const facturaId=this.route.snapshot.paramMap.get('facturaid');
            if(facturaId){
              this.facturaSelected=this.facturas.find(element=>{
                if(element.id==parseInt(facturaId)){
                  return element;
                }
              })
              if(this.facturaSelected){
                this.productsReceptionSelected=this.facturaSelected.products_reception.map(element=>{
                  element.custom_to=element.product_type_o_v_a?element.product_type_o_v_a.id + ' | ' + element.product_type_o_v_a.name + ' | ' + element.product_type_o_v_a.descriptions:null
                  element.custom_pt=element.ova_process_type?element.ova_process_type.id + ' | ' + element.ova_process_type.operation_type + ' | ' + element.ova_process_type.descriptions:null
                  return element;
                });
              }
            }
          }
        }).catch( error => {
          this.spinner.hide();
          if(error.error){
            if(error.error.error){
              if((error.error.error).indexOf("404 Not Found")){
                this.notificationService.showError('Error',{error:"Carpeta no existente"})
              }else{
                this.notificationService.showError('Error',error.error)
              }
            }
          }
          console.log("error:",error)
        });
      }else{
                this.notificationService.showError('Error',{error:"Debe ingresar el código de carpeta"})
      }
  }
  /*obtencion de formato de fecha*/ 
  formatDate(date:any){
    return moment.utc(date).format("YYYY-MM-DD HH:mm")
  }
  /*seleccion de fila*/
  selectRow(factura:Factura){
    this.facturaSelected=factura;
    if(factura.products_reception){
      this.productsReceptionSelected=factura.products_reception.map(element=>{
        element.custom_to=element.product_type_o_v_a?element.product_type_o_v_a.id + ' | ' + element.product_type_o_v_a.name + ' | ' + element.product_type_o_v_a.descriptions:null
        element.custom_pt=element.ova_process_type?element.ova_process_type.id + ' | ' + element.ova_process_type.operation_type + ' | ' + element.ova_process_type.descriptions:null
        /*element.product.lots=element.product && element.product.product_lots?element.product.product_lots.map(element=>{
          return element.lot;
        }):[];*/
        return element;
      });
    }
  }
  /*cierra la tabla de productos*/
  closeProductTable(){
    this.productsReceptionSelected=[];
    this.facturaSelected=null;
  }
  /*cierra la tabla de productos*/
  closeVersionTable(){
    this.versionsSelected=[];
  }
  /*navegacion por ruta*/ 
  navigateTo(route:any[]){
    this.router.navigate(route);
  }
  /*obtencion de datos de formulario*/
  getFormData(quantity:number,version_product:any,product_type_ova:any,process_type_ova:any,lot:any){
      this.formData.append("quantity", `${quantity}`);
      if(version_product)
        this.formData.append("id_version_product", `${version_product.id}`);
      if(process_type_ova)
        this.formData.append("id_ova_process_type", `${process_type_ova.id}`);
      if(product_type_ova)
        this.formData.append("id_ova_product_type", `${product_type_ova.id}`);
      if(lot)
        this.formData.append("id_lot", `${lot.id}`);
      return this.formData;
    }
    /*actualizar unidad*/
    updateUnit(id_product_reception:number,quantity_process:number,version_product:any,product_type_ova:any,process_type_ova:any,lot:any){
      this.spinner.show();
      this.productReceptionService.update(id_product_reception,this.getFormData(quantity_process,version_product,product_type_ova,process_type_ova,lot)).toPromise().then(
        response => {
          if(response!=undefined && response.data){
            this.spinner.hide();
            this.productsReceptionSelected=this.productsReceptionSelected.map(element=>{
              return element.id==response.data.id?{
                id:response.data.id?response.data.id:null,
                id_product:response.data.id_product?response.data.id_product:null,
                product:response.data.product?response.data.product:null,
                id_factura:response.data.id_factura?response.data.id_factura:null,
                factura:response.data.factura?response.data.factura:null,
                last_id_version_product:response.data.last_id_version_product?response.data.last_id_version_product:null,
                version_product:response.data.version_product?response.data.version_product:null,
                last_id_ova_product_type:response.data.last_id_ova_product_type?response.data.last_id_ova_product_type:null,
                last_quantity_reported:null,
                product_type_o_v_a:response.data.product_type_o_v_a?response.data.product_type_o_v_a:null,
                custom_to:response.data.product_type_o_v_a?response.data.product_type_o_v_a.id +' | '+response.data.product_type_o_v_a.name+' | '+response.data.product_type_o_v_a.descriptions:null,
                last_id_ova_process_type:response.data.last_id_ova_process_type?response.data.last_id_ova_process_type:null,
                ova_process_type:response.data.ova_process_type?response.data.ova_process_type:null,
                custom_pt:response.data.ova_process_type?response.data.ova_process_type.id +' | '+ response.data.ova_process_type.operation_type+' | '+ response.data.ova_process_type.descriptions:null,
                last_id_lot:response.data.last_id_lot?response.data.last_id_lot:null,
                lot:response.data.lot?response.data.lot:null,
                product_reception_by_version:response.data.product_reception_by_version?response.data.product_reception_by_version:[],
                quantity:response.data.quantity?response.data.quantity:null,
                quantity_reported: response.data.quantity_reported?response.data.quantity_reported:null,
                quantity_process: response.data.quantity_process?response.data.quantity_process:null,
                total_processed:response.data.total_processed?response.data.total_processed:null,
                cod_carpeta:response.data.cod_carpeta?response.data.cod_carpeta:null,
                status:response.data.status?response.data.status:null,
                checked:response.data.checked?response.data.checked:null,
                advance:response.data.advance?response.data.advance:null,
                total_advance:response.data.total_advance?response.data.total_advance:null,
                created_at: response.data.created_at,
                updated_at: response.data.updated_at,
              }:element;
            });     
            this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
          }
        }).catch( error => {
          this.spinner.hide();
          if(error.error)
          this.notificationService.showError('Error',error.error)
          console.log("error:",error)
        });
    }
    /*procesa unidad o fila de la tabla*/
    processUnit(id_product_reception:number,quantity_process:number,version_product:any,product_type_ova:any,process_type_ova:any,lot:any,total_processed:number,quantity:number){
      if(version_product || product_type_ova || process_type_ova || lot){      
        if(quantity_process>0 && quantity_process+total_processed>quantity){
          Swal.fire({
            title: 'Confirmar operación',
            text: '¿Estás seguro recepcionar más producto de los que están informado?',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
          }).then((result) => {
            if (result.value) {
              this.updateUnit(id_product_reception,quantity_process,version_product,product_type_ova,process_type_ova,lot);
            }
          })
        }else{
          this.updateUnit(id_product_reception,quantity_process,version_product,product_type_ova,process_type_ova,lot);
        }
      }else{
        this.notificationService.showError('Error',{error:"Debe seleccionar una versión del producto, producto tipo OVA o proceso tipo OVA"})
      }
    }
    /*guardar lote confirmado*/
    saveBatchProcessed(productReceptions:any[]){
      this.spinner.show();
      this.productReceptionService.batchProcessed(productReceptions).toPromise().then(
        response => {
          if(response!=undefined && response.data){
            this.spinner.hide();
            this.productsReceptionSelected=response.data;
            this.productsReceptionSelected=this.facturaSelected.products_reception.map(element=>{
                  element.custom_to=element.product_type_o_v_a?element.product_type_o_v_a.id + ' | ' + element.product_type_o_v_a.name + ' | ' + element.product_type_o_v_a.descriptions:null
                  element.custom_pt=element.ova_process_type?element.ova_process_type.id + ' | ' + element.ova_process_type.operation_type + ' | ' + element.ova_process_type.descriptions:null
                  return element;
                });
            this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
          }
        }).catch( error => {
          this.spinner.hide();
          if(error.error)
          this.notificationService.showError('Error',error.error)
          console.log("error:",error)
        });
    }
  /*procesa todas las filas de la tabla*/
  save(){
    let descriptions='';
    let productReceptions=this.productsReceptionSelected.map(element=>{
      if(element.quantity_process>0 && element.quantity_process+element.total_processed>element.quantity){
        descriptions=descriptions+element.product.descriptions+"<br>";
      }
      return {
        id:element.id,
        quantity:element.quantity_process,
        id_version_product:element.version_product?element.version_product.id:null,
        id_ova_process_type:element.ova_process_type?element.ova_process_type.id:null,
        id_ova_product_type:element.product_type_o_v_a?element.product_type_o_v_a.id:null,
        descriptions:element.product.descriptions,
      };
    })
    if(descriptions.length>0){
      Swal.fire({
        title: 'Confirmar operación',
        html: '¿Estás seguro recepcionar más producto de los que están informado en <strong>'+descriptions+'</strong>?',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value) {
          this.saveBatchProcessed(productReceptions);
        }
      })
    }else{
      this.saveBatchProcessed(productReceptions);
    }
  }
  /*obtiene la ultima version del producto*/
  getLastVersionProduct(productReception:any){
    // const lastVersionProduct=this.productsReceptionSelected[i].product_reception_by_version.find(element=>{
    const lastVersionProduct=productReception.product_reception_by_version.find(element=>{  
      if(element.id_version_product==productReception.last_id_version_product){
        return element;
      }
    });
    return lastVersionProduct&&lastVersionProduct.quantity_reported>0?lastVersionProduct:{quantity_reported:'Sin cantidad registrada'};
  }
  openProductReceptionProcessed(content:any,productReception:ProductReception){
    this.productReceptionByVersion=productReception.product_reception_by_version;
    this.modalRef=this.modalService.open(content,{size: 'lg'});
  }
  /* detector de cambio cambio en select */ 
  selectionChanged(event:any,j:number,element:string,productReception:any){
      switch (element) {
        case "version_product":
          this.productReceptionByVersionSelected=null
          if(this.productsReceptionSelected[j]){
            this.productsReceptionSelected[j].last_id_version_product=event.value?event.value.id:null;
            const find=productReception.product_reception_by_version.find(element=>{
              if(element.id_version_product==this.productsReceptionSelected[j].last_id_version_product){
                return element;
              }
            });
            productReception.last_quantity_reported=find?find.quantity_reported:null            
          }
          break;
        default:
        break;
      }
    }
    /*generacion de reporte en excel*/
    generateReport(){
      this.data=new Array();
      for(let productReception of this.productsReceptionSelected){
        const i=this.productsReceptionSelected.indexOf(productReception);
        this.data.push({
          cod_sap: productReception.product.cod_sap,
          descriptions: productReception.product.descriptions,
          quantity: productReception.quantity?productReception.quantity:'Sin cantidad original registrada',
          quantity_reported: productReception.last_id_version_product?this.getLastVersionProduct(i).quantity_reported:'Sin cantidad registrada',
          total_processed: productReception.total_processed?productReception.total_processed:'Sin cantidad procesada',
          version_product: productReception.version_product?productReception.version_product.name:'Sin versión de producto',
          product_type_o_v_a: productReception.product_type_o_v_a?productReception.product_type_o_v_a.name:'Sin producto tipo OVA',
          ova_process_type: productReception.ova_process_type?productReception.ova_process_type.operation_type:'Sin proceso tipo OVA',
          lot: productReception.lot?productReception.lot.name:'Sin lote',
          product_brand: productReception.product.product_brand?productReception.product.product_brand.name:'Sin marca de producto',
          factura: productReception.factura?productReception.factura.folioNum:'Sin factura'
        });
      }     
      this.exportAsExcelFile(this.data, 'listado-product-reception');
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
    showProductVersions(versions:VersionProduct[]){
      this.versionsSelected=versions;
    }
  selectFolder(folder:Folder){
    this.folder=folder;
    this.folderCode=this.folder.cod_carpeta?this.folder.cod_carpeta:null
    this.facturas=folder.facturas;
  }
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  ngOnDestroy() {
  }
}