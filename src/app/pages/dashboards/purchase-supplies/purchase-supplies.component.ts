import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { NotificationService } from "src/app/services/notification/notification.service";
import { PurchaseSuppliesService } from "src/app/services/purchase-supplies/purchase-supplies.service";
import { SupplieVersionService } from "src/app/services/supplie-version/supplie-version.service";
import { SupplieService } from "src/app/services/supplie/supplie.service";
import { GroupService } from "src/app/services/group/group.service";
import { Supplie } from "src/app/models/supplie";
import { SupplieVersion } from "src/app/models/supplie-version";
import { PurchaseSupplie } from "src/app/models/purchase-supplie";
import { PurchaseOrderDetail } from "src/app/models/purchase-order-detail";
import { ReserveInvoiceDetail } from "src/app/models/reserve-invoice-detail";
import { supplieConfigObj, groupConfigObj } from "./selectsconfigs/configs";

//moment
import * as moment from "moment";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


@Component({
  selector: "app-purchase-supplies",
  templateUrl: "purchase-supplies.component.html",
  styleUrls: ["purchase-supplies.component.scss"]
})
export class PurchaseSuppliesComponent implements OnInit, OnDestroy {  
  public modalRef:any=null;
  //sort 
  public highestToLowest: any={
    cod_interno:false,
    cod_sap:false,
    descriptions:false,
    tamano:false,
    group:false,
    cantidad_oc:false,
    cantidad_fr:false,
    a_comprar:false
  };

  public purchaseSupplies:PurchaseSupplie[]=[];
  public purchasesOrderDetail:PurchaseOrderDetail[]=[];
  public reservesInvoiceDetail:ReserveInvoiceDetail[]=[]
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //excel file
  public data: Array<any>=null;

  public documents:any[]=[];

  public supplieConfig:any = supplieConfigObj;
  public supplieVersionSelected:SupplieVersion=null;
  public suppliesVersions:SupplieVersion[]=[];
  public supplieSelected:Supplie=null;
  public supplies:Supplie[]=[]

  public formData = new FormData();

  public fileData: File = null;
  public previewUrl: any = null;

  public groupConfig:any = groupConfigObj;
  public groups:any[]=[];
  public groupSelected:number=null;

  constructor(
    public notificationService: NotificationService,
    public groupService:GroupService,
    public supplieService: SupplieService,
    public supplieVersionService:SupplieVersionService,
    public purchaseSuppliesService:PurchaseSuppliesService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService ) {
  }

  ngOnInit() {
    this.getPurchasesSupplies();
    this.getSupplieVersions();
    this.setDefaultValues();
    this.getSupplies();
    this.getGroups();
  }
  /*obtencion de grupos*/
  getGroups(){
    this.spinner.show();
    this.groupService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.groups=response.data;
        }
      }
      ).catch( 
      error => {
        this.spinner.hide();
        console.log("error:",error)
      }
      );
    }
    /* obtencion de listado de insumos */ 
    getSupplies(){
      this.spinner.show();
      this.supplieService.getAll().toPromise().then(
        response => {
          if(response!=undefined && response.data){
            this.spinner.hide();
            this.supplies=response.data;
          }
        }
        ).catch( 
        error => {        
          this.spinner.hide();
          console.log("error:",error)
        }
        );
      } 
      /*obtencion de versiones de insumo*/
      getSupplieVersions(){
        this.spinner.show();
        this.supplieVersionService.getAll().toPromise().then(
          response => {
            if(response!=undefined && response.data){
              this.spinner.hide();
              this.suppliesVersions=response.data;
            }
          }).catch( error => {        
            this.spinner.hide();
            console.log("error:",error)
          });
        }

        /*abre modal*/
        open(content) {
          this.modalRef=this.modalService.open(content);
        }
        /*ordenado de listado por orden alfabetico*/ 
        sortTableBy(element:string){
          switch (element) {
            case "cod_interno":
            if(this.highestToLowest.cod_interno){
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (a.supplie.cod_interno.toLowerCase() > b.supplie.cod_interno.toLowerCase()) return 1;
                if (a.supplie.cod_interno.toLowerCase() < b.supplie.cod_interno.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (b.supplie.cod_interno.toLowerCase() > a.supplie.cod_interno.toLowerCase()) return 1;
                if (b.supplie.cod_interno.toLowerCase() < a.supplie.cod_interno.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.cod_interno=!this.highestToLowest.cod_interno;
            break;
            case "cod_sap":
            if(this.highestToLowest.cod_sap){
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (a.supplie.cod_sap.toLowerCase() > b.supplie.cod_sap.toLowerCase()) return 1;
                if (a.supplie.cod_sap.toLowerCase() < b.supplie.cod_sap.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (b.supplie.cod_sap.toLowerCase() > a.supplie.cod_sap.toLowerCase()) return 1;
                if (b.supplie.cod_sap.toLowerCase() < a.supplie.cod_sap.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.cod_sap=!this.highestToLowest.cod_sap;
            break;
            case "descriptions":
            if(this.highestToLowest.descriptions){
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (a.supplie.descriptions.toLowerCase() > b.supplie.descriptions.toLowerCase()) return 1;
                if (a.supplie.descriptions.toLowerCase() < b.supplie.descriptions.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (b.supplie.descriptions.toLowerCase() > a.supplie.descriptions.toLowerCase()) return 1;
                if (b.supplie.descriptions.toLowerCase() < a.supplie.descriptions.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.descriptions=!this.highestToLowest.descriptions;
            break;
            case "tamano":
            if(this.highestToLowest.tamano){
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (a.supplie.tamano.toLowerCase() > b.supplie.tamano.toLowerCase()) return 1;
                if (a.supplie.tamano.toLowerCase() < b.supplie.tamano.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (b.supplie.tamano.toLowerCase() > a.supplie.tamano.toLowerCase()) return 1;
                if (b.supplie.tamano.toLowerCase() < a.supplie.tamano.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.tamano=!this.highestToLowest.tamano;
            break;            
            case "group":
            if(this.highestToLowest.group){
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (a.supplie.group.descriptions.toLowerCase() > b.supplie.group.descriptions.toLowerCase()) return 1;
                if (a.supplie.group.descriptions.toLowerCase() < b.supplie.group.descriptions.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (b.supplie.group.descriptions.toLowerCase() > a.supplie.group.descriptions.toLowerCase()) return 1;
                if (b.supplie.group.descriptions.toLowerCase() < a.supplie.group.descriptions.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.group=!this.highestToLowest.group;
            break;
            case "cantidad_oc":
            if(this.highestToLowest.cantidad_oc){
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (a.cantidad_oc > b.cantidad_oc) return 1;
                if (a.cantidad_oc < b.cantidad_oc) return -1;
                return 0;
              });
            }else{
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (b.cantidad_oc > a.cantidad_oc) return 1;
                if (b.cantidad_oc < a.cantidad_oc) return -1;
                return 0;
              });
            }
            this.highestToLowest.cantidad_oc=!this.highestToLowest.cantidad_oc;
            break;
            case "cantidad_fr":
            if(this.highestToLowest.cantidad_fr){
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (a.cantidad_fr > b.cantidad_fr) return 1;
                if (a.cantidad_fr < b.cantidad_fr) return -1;
                return 0;
              });
            }else{
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (b.cantidad_fr > a.cantidad_fr) return 1;
                if (b.cantidad_fr < a.cantidad_fr) return -1;
                return 0;
              });
            }
            this.highestToLowest.cantidad_fr=!this.highestToLowest.cantidad_fr;
            break;
            case "a_comprar":
            if(this.highestToLowest.a_comprar){
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (a.a_comprar > b.a_comprar) return 1;
                if (a.a_comprar < b.a_comprar) return -1;
                return 0;
              });
            }else{
              this.purchaseSupplies=this.purchaseSupplies.sort((a, b) => {
                if (b.a_comprar > a.a_comprar) return 1;
                if (b.a_comprar < a.a_comprar) return -1;
                return 0;
              });
            }
            this.highestToLowest.a_comprar=!this.highestToLowest.a_comprar;
            break;
            default:
            // code...
            break;
          }
        }
        getPurchasesSupplies(){
          this.spinner.show();
          this.purchaseSuppliesService.getAll().toPromise().then(
            response => {
              if(response!=undefined && response.data){
                this.spinner.hide();
                const purchaseSupplies=response.data.supplies;
                this.documents=response.data.documents;            
                this.purchaseSupplies=purchaseSupplies.map(element=>{
                  const cantidad_oc=element.cod_sap?this.getSummationOpenQty_OC(element,this.documents,"OC"):element.en_transito;
                  const cantidad_fr=element.directrizs.length>0?this.getSummationOpenQty_FR(element,this.documents,"FR",element.directrizs):0;
                  const a_comprar=(element.version_insumos_stock + cantidad_oc) - cantidad_fr;
                  return {
                    id:this.purchaseSupplies.length+1,
                    supplie:element,
                    cantidad_oc:cantidad_oc,
                    cantidad_fr:cantidad_fr,
                    a_comprar:(element.version_insumos_stock + cantidad_oc) - cantidad_fr,
                    created_at: new Date(),
                    updated_at: new Date()
                  }
                });
                this.purchaseSupplies=this.purchaseSupplies.filter(element=>{
                  if(element.cantidad_fr>0){
                    return element;
                  }
                })
              }
            }
            ).catch( 
            error => {
              this.spinner.hide();
              console.log("error:",error)
            }
            );
          }
          getSummationOpenQty_OC(supplie:Supplie,documents:any[],doc:string){
            let result = 0;
            const documentsDT_doc=documents.filter(element=>{
              if(element.tipoDoc=="OC"){
                return element;
              }
            })
            if(documentsDT_doc.length>0){
              for(const element of documentsDT_doc){
                for(const product of element.productosOCFR){
                  if(doc=="OC"){
                    if(product.id==supplie.cod_sap){
                      result=result+product.openQty;
                    }
                  }
                }
              }
            }
            return result;
          }
          getSummationOpenQty_FR(supplie:Supplie,documents:any[],doc:string,directrizs:any[]){
            let result = 0;
            const documentsDT_doc=documents.filter(element=>{
              if(element.tipoDoc=="FR" || element.tipoDoc=="OC"){
                return element;
              }
            })
            if(documentsDT_doc.length>0){
              for(const element of documentsDT_doc){
                for(const product of element.productosOCFR){
                  for(const directriz of directrizs){
                    if(product.id==directriz.product.cod_sap && supplie.version_insumos_id==directriz.id_version_insumo){
                      result=result+product.openQty;
                    }
                  }
                }
              }
            }
            return result;
          }
          /*muestra detalles de orden de compra*/
          showPurchaseOrderDetail(content:any,supplie:Supplie){
            if(supplie.cod_sap){
              const documentsDT_doc=this.documents.filter(element=>{
                if(element.tipoDoc=="OC"){
                  return element;
                }
              })
              if(documentsDT_doc.length>0){
                for(const element of documentsDT_doc){
                  for(const product of element.productosOCFR){
                    if(product.id==supplie.cod_sap){
                      this.purchasesOrderDetail.push({
                        id: product.compraId,
                        supplie: supplie,
                        cantidad_oc: product.openQty,
                        docDate:element.docDate?this.formatDate(element.docDate):'Sin fecha de documento'
                      })
                    }
                  }
                }
              }
            }else{
              this.purchasesOrderDetail.push({
                id: "Sin id de compra",
                supplie: supplie,
                cantidad_oc: supplie.en_transito,
                docDate:'Sin documento'
              })
            }
            this.modalRef=this.modalService.open(content,{size: 'lg',backdrop:'static'});
          }
          /*cerrado de detalle de orden de compra*/
          closePurchaseOrderDetail(){
            this.purchasesOrderDetail=[];
            this.modalRef.close();
          }
          /*muestra detalles de reservacion de factura*/
          showReservationInvoiceDetail(content:any,supplie:Supplie){
            const documentsDT_doc=this.documents.filter(element=>{
              if(element.tipoDoc=="FR" || element.tipoDoc=="OC"){
                return element;
              }
            })
            if(documentsDT_doc.length>0){
              for(const element of documentsDT_doc){
                for(const product of element.productosOCFR){
                  for(const directriz of supplie.directrizs){
                    if(product.id==directriz.product.cod_sap  && supplie.version_insumos_id==directriz.id_version_insumo){
                      this.reservesInvoiceDetail.push({
                        id: product.compraId,
                        supplie: supplie,
                        cantidad_fr: product.openQty,
                        docDate:element.docDate?this.formatDate(element.docDate):'Sin fecha de documento'
                      })
                    }
                  }
                }
              }
            }
            this.modalRef=this.modalService.open(content,{size: 'lg',backdrop:'static'});
          }
          /*cerrado de detalle de factura reserva*/
          closeReservationInvoiceDetail(){
            this.reservesInvoiceDetail=[];
            this.modalRef.close();
          }
          /*generacion de reporte en excel*/
          generateReport(){    
            this.data=new Array();
            for(let purchaseSupplie of this.purchaseSupplies){
              this.data.push({
                cod_interno: purchaseSupplie.supplie.cod_interno,
                cod_sap: purchaseSupplie.supplie.cod_sap,
                descriptions: purchaseSupplie.supplie.descriptions,
                group: purchaseSupplie.supplie.group.descriptions,
                tamano: purchaseSupplie.supplie.tamano,
                cantidad_oc: purchaseSupplie.cantidad_oc,
                cantidad_fr: purchaseSupplie.cantidad_fr,
                a_comprar:purchaseSupplie.a_comprar
              });
            }     
            this.exportAsExcelFile(this.data, 'listado-insumos');        
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
          /*obtiene formato de fecha*/
          formatDate(date:Date){
            return moment.utc(date).format("YYYY-MM-DD HH:mm:ss");
          }
          showSupplieForm(supplie:any,content:any){
            this.supplieSelected=Object.assign({},supplie);
            if(this.supplieSelected){
              this.previewUrl=this.supplieSelected.imagen;
              this.groupSelected=this.groups.find(element=>{
                return element.id==this.supplieSelected.id_grupo;
              });
              this.modalRef=this.modalService.open(content,{size: 'lg'});
            }
          }
          showSupplieVersionForm(version_insumos_id:number,content:any){
            this.supplieVersionSelected=this.suppliesVersions.find(element=>{
              if(element.id==version_insumos_id){
                return element;
              }
            })
            if(this.supplieVersionSelected){
              this.previewUrl=this.supplieVersionSelected.imagen;
              this.supplieSelected=this.supplies.find(element=>{
                return element.id==this.supplieVersionSelected.id_insumo;
              });
              this.modalRef=this.modalService.open(content,{size: 'lg'});
            }
          }
          /* obtencion de datos de formulario */ 
          getFormData(element:string){
            switch (element) {
              case "supplie-version":
              this.formData.append("nombre", `${this.supplieVersionSelected.nombre}`); 
              this.formData.append("id_insumo", `${this.supplieVersionSelected.id_insumo}`); 
              this.formData.append("imagen", this.supplieVersionSelected.imagen);
              break;
              case "supplie":
              this.formData.append("id_grupo", `${this.supplieSelected.id_grupo}`); 
              this.formData.append("cod_interno", `${this.supplieSelected.cod_interno}`); 
              if(this.supplieSelected.cod_sap)
                this.formData.append("cod_sap", `${this.supplieSelected.cod_sap}`);   
              this.formData.append("descriptions", `${this.supplieSelected.descriptions}`); 
              this.formData.append("en_transito", `${this.supplieSelected.en_transito}`);  
              this.formData.append("tamano", `${this.supplieSelected.tamano}`);      
              this.formData.append("inventariado", `${this.supplieSelected.inventariado}`);
              this.formData.append("informar", `${this.supplieSelected.informar}`);
              this.formData.append("comprar", `${this.supplieSelected.comprar}`);
              this.formData.append("imagen", this.supplieSelected.imagen);
              break;
              default:
              // code...
              break;
            }
            return this.formData;
          }
          updateSupplie(){
            if(this.supplieSelected.id){
              this.spinner.show();
              this.supplieService.updateElement(this.supplieSelected.id,this.getFormData('supplie')).toPromise().then(
                response => {
                  if(response!=undefined && response.data){
                    this.purchaseSupplies=this.purchaseSupplies.map(element=>{
                      if(element.supplie.id==response.data.id){
                        element.supplie.id_grupo=response.data.id_grupo;
                        element.supplie.cod_interno=response.data.cod_interno;
                        element.supplie.cod_sap=response.data.cod_sap;
                        element.supplie.descriptions=response.data.descriptions;
                        element.supplie.en_transito=response.data.en_transito;
                        element.supplie.tamano=response.data.tamano;
                        element.supplie.inventariado=response.data.inventariado;
                        element.supplie.informar=response.data.informar;
                        element.supplie.comprar=response.data.comprar;
                        element.supplie.imagen=response.data.imagen;
                      }
                      return element;
                    })
                    this.spinner.hide();
                    this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                    this.modalRef.close();  
                    this.setDefaultValues();

                  }
                }
                ).catch(
                error => {
                  console.log("error:",error)
                  this.spinner.hide();
                  if(error.error)
                    this.notificationService.showError('Error',error.error) 
                }
                );      
              } 
            }
            updateSupplieVersion(){
              if(this.supplieVersionSelected.id){
                this.spinner.show();
                this.supplieVersionService.updateElement(this.supplieVersionSelected.id,this.getFormData('supplie-version')).toPromise().then(
                  response => {
                    if(response!=undefined && response.data){
                      this.purchaseSupplies=this.purchaseSupplies.map(element=>{
                        if(element.supplie.id==response.data.id){
                          element.supplie.version_insumos_nombre=response.data.nombre;
                          element.supplie.version_insumos_id=response.data.id;
                        }
                        return element;
                      })
                      this.spinner.hide();
                      this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                      this.modalRef.close();  
                      this.setDefaultValues();
                    }
                  }
                  ).catch(
                  error => {
                    console.log("error:",error)
                    this.spinner.hide();
                    if(error.error)
                      this.notificationService.showError('Error',error.error) 
                  }
                  );      
                } 
              }
              /* carga de valores por defecto */ 
              setDefaultValues(){
                this.formData=new FormData();
                this.supplieSelected=null;
                this.supplieVersionSelected=null;
                this.previewUrl=null;
                this.fileData=null;
                this.groupSelected=null;
              }
              /*cierra el modal del formulario*/
              closeFormModal(){
                this.modalRef.close();
                this.setDefaultValues();
              }
              /*<<<<<<<<<<<<<<<<<<<<<<<MANEJO DE IMAGEN>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
              async fileProgress(fileInput: any,element:string) {
                this.fileData = <File>fileInput.target.files[0];
                this.preview(element);
              }

              preview(element:string) {
                if (
                  this.fileData.type.match("image/png") ||
                  this.fileData.type.match("image/jpg") ||
                  this.fileData.type.match("image/jpeg") 
                  ) {
                  switch (element) {
                    case "supplie":
                    this.supplieSelected.imagen=this.fileData;
                    var reader = new FileReader();
                    reader.readAsDataURL(this.fileData);
                    reader.onload = _event => {
                      this.previewUrl = reader.result;
                    };
                    break;
                    case "supplie-version":
                    this.supplieVersionSelected.imagen=this.fileData;
                    var reader = new FileReader();
                    reader.readAsDataURL(this.fileData);
                    reader.onload = _event => {
                      this.previewUrl = reader.result;
                    };
                    break;

                    default:
                    // code...
                    break;
                  }

                }else{
                  this.notificationService.showWarning('Formato no permitido','Solo se permite formato .png, .jpg, y .jpeg')
                }
              }
              radioCheck(element:string,value:number){
                switch (element) {
                  case "inventariable":
                  this.supplieSelected.inventariado=value;
                  break;
                  case "informa":
                  this.supplieSelected.informar=value;
                  break;
                  case "compra":
                  this.supplieSelected.comprar=value;
                  break;
                  default:
                  // code...
                  break;
                }
              }
              //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
              ngOnDestroy() {
              }

            }
