import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { User } from "src/app/models/user";
import { Product } from "src/app/models/product";
import { Folder } from "src/app/models/folder";
import { ProductReceivedByVersion } from "src/app/models/product-received-by-version";
import { ProductService } from "src/app/services/product/product.service";
import { ProductReceptionService } from "src/app/services/product-reception/product-reception.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import Swal from "sweetalert2";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


@Component({
  selector: 'app-products-by-folder',
  templateUrl: './products-by-folder.component.html'
})
export class ProductsByFolderComponent implements OnInit {
  @ViewChild('errorlist') private errorList: TemplateRef<any>;

  @ViewChild('previewlist') private previewList: TemplateRef<any>;

  public modalRef:any=null;

  public user:User=null;
  public products:Product[]=[];

  //paginacion
  public p: number = 1;
  //buscador 
  public searchTableProduct: string=null;
  public errorMessages:any[]=[];
  //código de confirmacion
  public confirm:any={
    code:null,
    input:null
  };

  //cerrar carpeta
  public folder:Folder=null;
  public closeFolder:number=0;
  public folderClosed:boolean=false;

  //busqueda de tabla de preview
  public searchPreviewTable:string=null;

  public previewsBatchReceived:any=[];
  //excel file
  public data: Array<any>=null;
  public allProductsReceivedByVersion:ProductReceivedByVersion[]=[];
  constructor(
    public productService: ProductService,
    public productReceptionService:ProductReceptionService,
    public spinner: NgxSpinnerService,
    public notificationService:NotificationService,
    public modalService: NgbModal,
    public route:ActivatedRoute) { }

  ngOnInit() {
  	if(this.route.snapshot.paramMap.get('id')){  
      this.getUser();
    }
  }
  getUser(){    
    this.user=JSON.parse(localStorage.getItem("user")).user;
    this.getProductsReceptionByInvoice();
  }
  getProductsReceptionByInvoice(){
  	this.spinner.show();
    this.productReceptionService.getByFolder(parseInt(this.route.snapshot.paramMap.get('id'))).toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.folder=response.data;
          console.log("folder:",this.folder)
          for(let invoice of this.folder.facturas){
            for(let product_received_by_version of invoice.products_received_by_version){
              this.allProductsReceivedByVersion.push(product_received_by_version)
            }
          }
          this.spinner.hide();
          this.folderClosed=response.data.status=="cerrada"?true:false;
        }
      }).catch( error => {
        this.spinner.hide();
        console.log("error:",error)
      });
    }
    //getQuantityReceived(i:number){
    getQuantityReceived(productReceived:any){
      let productReceivedFind=null;
      for(let prbv of this.allProductsReceivedByVersion){
        const prbvFind=prbv.product_reception.product_reception_by_version.find(element=>{
          if(element.id_product_reception ==productReceived.id_product_reception && element.id_version_product==productReceived.id_version_product) return element;
        });
        if(prbvFind) productReceivedFind=prbvFind
      }        
      return productReceivedFind?productReceivedFind.quantity_reported:'Sin cantidad registrada';
    }
    /*updateReceived(j:number,id_product_reception:number,version_product:any,quantity_received:number,quantity_process:number){
      this.spinner.show();
      this.productReceptionService.updateReceived({
        id_product_reception:id_product_reception,
        id_version_product:version_product.id,
        quantity:quantity_process,
        quantity_received:this.getQuantityReceived(j),
        id_user:this.user.id,
        id_folder:this.folder.id
      }).toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.this.allProductsReceivedByVersion=this.this.allProductsReceivedByVersion.map(element=>{
            return element.id==response.data.id?response.data:element;
          }); 
          this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
        }
      }).catch( error => {
        this.spinner.hide();
        if(error.error)
          this.notificationService.showError('Error',error.error)
        console.log("error:",error)
      });
    }*/
    /*procesa unidad o fila de la tabla*/
   /* processUnit(j:number,id_product_reception:number,version_product:any,quantity_received:number,quantity_process:number){
      if(version_product && id_product_reception){ 
        if(quantity_process>0 && quantity_process+quantity_received>this.getQuantityReceived(j)){
          Swal.fire({
            title: 'Confirmar operación',
            text: 'Estás procesando más productos de lo que estan recepcionados, ¿estás seguro que desea procesar?',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
          }).then((result) => {
            if (result.value) {
              this.updateReceived(j,id_product_reception,version_product,quantity_received,quantity_process);
            }
          })
        }else{
          this.updateReceived(j,id_product_reception,version_product,quantity_received,quantity_process);
        }
      }else{
        this.notificationService.showError('Error',{error:"Debe seleccionar una versión del producto, producto tipo OVA o proceso tipo OVA"})
      }
    }*/
    closeListErrors(){
      this.errorMessages=[];
      this.modalRef.close(); 
    }
    confirmSave(content:any){
      if(this.modalRef)
        this.modalRef.close(); 
      this.confirm.code=this.getRandomString(4);
      this.confirm.input=null;
      this.modalRef=this.modalService.open(content,{size: 'lg'});
    }
    closeConfirmSave(){
      this.modalRef.close();       
    }
    confirmCode(){
      if(this.confirm.code==this.confirm.input){
        this.modalRef.close();
        this.confirmSaveElements();
      }
    }
    getPreviewBatchReceived(productReceivedsByInvoice:any[]){
      this.spinner.show();
      this.productReceptionService.getPreviewBatchReceived(productReceivedsByInvoice).toPromise().then(
        response => {
          if(response!=undefined && response.data){
            this.spinner.hide();
            console.log("response:",response)
            this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
            this.previewsBatchReceived=response.data;
            if(this.previewsBatchReceived.length>0){
               this.modalRef=this.modalService.open(this.previewList,{size: 'lg'});
            }
          }
        }).catch( error => {
          this.spinner.hide();
          if(error.error)
            this.notificationService.showError('Error',error.error)
          console.log("error:",error)
        });
    }
    confirmPreviewBatchReceived(){
      let descriptions='';
        this.previewsBatchReceived=[];
        let productReceptionsByInvoice=this.allProductsReceivedByVersion.map(element=>{
          const i=this.allProductsReceivedByVersion.indexOf(element);
          if(element.quantity_process>0 && element.quantity_process+element.quantity_received>this.getQuantityReceived(i)){
            descriptions=descriptions+element.product_reception.product.descriptions+"<br>";
          }
          return {
              id_product_reception:element.id_product_reception,
              id_version_product:element.id_version_product,
              quantity:element.quantity_process,
              quantity_received:this.getQuantityReceived(i),
              id_user:this.user.id,
            };
        })
        if(descriptions.length>0){
          Swal.fire({
            title: 'Confirmar operación',
            html: 'Estás procesando más productos de lo que estan recepcionados en <strong>'+descriptions+'</strong>, ¿estás seguro que desea procesar?',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
          }).then((result) => {
            if (result.value) {
              this.getPreviewBatchReceived(productReceptionsByInvoice);
            }
          })
        }else{
          this.getPreviewBatchReceived(productReceptionsByInvoice);
        }  
      
        
    }
    closeListPreviews(){
      this.modalRef.close(); 
    }
    showLastPreview(content:any){
      if(this.previewsBatchReceived.length>0){
        this.modalRef=this.modalService.open(content,{size: 'lg'});
      }else{
        this.notificationService.showInfo('Información','Sin preview cargada')
      }
    }
    saveBatchReceived(productReceivedsByInvoice:any[]){
      this.spinner.show();
      this.productReceptionService.batchReceived(this.folder.id,this.closeFolder,productReceivedsByInvoice).toPromise().then(
        response => {
          if(response!=undefined && response.data){
            this.spinner.hide();
            this.folderClosed=response.data.folder_status=="cerrada"?true:false;
            if(response.data.recipients>0){
              this.notificationService.showSuccess('Operación realiza exitosamente','Notificación enviada por email a '+response.data.recipients+' destinatarios')
            }
            const messages=response.data.messages;
            const elements=response.data.elements;
            for(const element of elements){
              this.allProductsReceivedByVersion=this.allProductsReceivedByVersion.map(elementMap=>{
                return elementMap.id==element.id?element:elementMap;
              }); 
            }
            for(const message of messages){
              switch (message.type) {
                case "success":
                  // code...
                  this.notificationService.showSuccess('Operación realiza exitosamente',message.content)
                  break;
                case "error":
                  this.errorMessages.push(message);
                  this.notificationService.showError('Operación realiza exitosamente',{error:message.content})
                  break;
                default:
                  // code...
                  break;
              }
            }
            if(this.errorMessages.length>0){
              this.modalRef=this.modalService.open(this.errorList,{size: 'lg'});
            }
          }
        }).catch( error => {
          this.spinner.hide();
          if(error.error)
            this.notificationService.showError('Error',error.error)
          console.log("error:",error)
        });
    }
    confirmSaveElements(){
      if(this.modalRef)
        this.modalRef.close();
      let descriptions='';

        let productReceptionsByInvoice=this.allProductsReceivedByVersion.map(element=>{
          const i=this.allProductsReceivedByVersion.indexOf(element);
        if(element.quantity_process>0 && element.quantity_process+element.quantity_received>this.getQuantityReceived(element)){
            descriptions=descriptions+element.product_reception.product.descriptions+"<br>";
          }
          return {
              id_product_reception:element.id_product_reception,
              id_version_product:element.id_version_product,
              quantity:element.quantity_process,
              quantity_received:this.getQuantityReceived(element),
              id_user:this.user.id,
            };
        })
        productReceptionsByInvoice=productReceptionsByInvoice.filter(element=>{
          if(element.quantity!=undefined && element.quantity!=null){
            return element;
          }
        })
        if(descriptions.length>0){
          Swal.fire({
            title: 'Confirmar operación',
            html: 'Estás procesando más productos de lo que estan recepcionados en <strong>'+descriptions+'</strong>, ¿estás seguro que desea procesar?',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
          }).then((result) => {
            if (result.value) {
              this.saveBatchReceived(productReceptionsByInvoice);
            }
          })
        }else{
          this.saveBatchReceived(productReceptionsByInvoice);
        }
     }
  processAdvanceValues(id_product_reception:number,value:number){
    if(value){
      this.spinner.show();
      this.productReceptionService.processAdvanceValues(id_product_reception,{advance:value}).toPromise().then(response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.allProductsReceivedByVersion=this.allProductsReceivedByVersion.map(element=>{
            if(element.product_reception.id==response.data.id){
              element.product_reception.advance=response.data.advance;
              element.product_reception.total_advance=response.data.total_advance;
            }
            return element;
          })
        }
      }).catch( error => {
        this.spinner.hide();
        if(error.error)
          this.notificationService.showError('Error',error.error)
        console.log("error:",error)
      });
    }
  }
      getRandomString(longitud) {
        longitud = longitud || 16;
        const caracteres = "0123456789abcdefghijklmnopqrstuvwxyz";
        var cadena = "";
        var max = caracteres.length-1;
        for (var i = 0; i<longitud; i++) {
            cadena += caracteres[ Math.floor(Math.random() * (max+1)) ];
        }
        return cadena;
      }
      getStatusColor(status:string){
        if(status.toLowerCase().match(/^falta.*$/) || status.toLowerCase().match(/^no existe.*$/))
          return "#ff0000";
        if(status.toLowerCase().match(/^pendiente.*$/))
          return "#ff7f00";
        (status.toLowerCase().match(/^aprobado.*$/))
          return "#00990a";
      }
      radioCheck(element:string,value:number){
        switch (element) {
          case "closed":
          this.closeFolder=value;
          break;
          default:
          // code...
          break;
        }
      }
      /*generacion de reporte en excel*/
       generateReport(){
          this.data=new Array();
          for(let productReceived of this.allProductsReceivedByVersion){
            const i=this.allProductsReceivedByVersion.indexOf(productReceived);
            const factura=this.folder.facturas.find(element=>{
              if(element.id==productReceived.id_factura){
                return element;
              }
            })
            this.data.push({
              product_cod_sap:productReceived.product_reception.product.cod_sap,
              product_descriptions:productReceived.product_reception.product.descriptions,
              product_reception_quantity:productReceived.product_reception.quantity?productReceived.product_reception.quantity:'Sin cantidad original registrada',
              quantity_received:this.getQuantityReceived(productReceived),
              quantity_procesed:productReceived.quantity_received,
              product_version:productReceived.version?productReceived.version.name:'Sin versión de producto',
              status:productReceived.status?productReceived.status:'Sin estado',
              product_type_o_v_a:productReceived.product_reception.product_type_o_v_a?productReceived.product_reception.product_type_o_v_a.name:'Sin producto tipo OVA',
              ova_process_type:productReceived.product_reception.ova_process_type?productReceived.product_reception.ova_process_type.operation_type:'Sin proceso tipo OVA',
              lote:productReceived.product_reception.lot?productReceived.product_reception.lot.name:'Sin lote',
              product_brand_name:productReceived.product_reception.product.product_brand.name,
              factura:factura?factura.folioNum:'Sin factura registrada'
            });
          }     
          this.exportAsExcelFile(this.data, 'listado-ova');
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

}