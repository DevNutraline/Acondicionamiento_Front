import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import { FolderService } from "src/app/services/folder/folder.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { Folder } from "src/app/models/folder";
import { Product } from "src/app/models/product";
import Swal from "sweetalert2";
import * as moment from "moment";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


@Component({
  selector: "app-folders",
  templateUrl: "folders.component.html",
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnInit, OnDestroy {  
  public modalRef:any=null;
  public folders:Folder[]=[];
  public folder:Folder=new Folder();
  //paginaciones
  public p1: number = 1;
  public p2: number = 1;
  //buscador 
  public searchFolderTable: string=null;
  public searchProductTable: string=null;
  //sort 
  public highestToLowest: any={
    cod_carpeta:false,
    type:false,
    status:false,
    created_at:false,
    closed_at:false,
  };
  //excel file
  public data: Array<any>=null;
  public dateReleasedSale:any=null;

  public products:Product[]=[];

  constructor(
    public folderService:FolderService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService ) {
  }

  ngOnInit() {
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
    /*abre modal*/
    open(content) {
      this.folder=new Folder();
      this.modalRef=this.modalService.open(content,{size: 'lg'});
    }

    /* registra o actualiza elemento */ 
    register(){
      if(this.folder.id){
        this.spinner.show();
        this.folderService.updateElement(this.folder.id,this.folder).toPromise().then(
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
          this.folderService.create(this.folder).toPromise().then(
            response => {
              if(response!=undefined && response.data){
                this.spinner.hide();
                this.folders.push(response.data)
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

        /*edicion de elemento*/
        edit(folder:Folder,content:any){
          this.folder=Object.assign({},folder);
          this.modalRef=this.modalService.open(content);
        }
        /* eliminacion de elemento por id */ 
        delete(id:number){
          this.folder=this.folders.find(element=>{
            return element.id==id?element:null
          })          
          Swal.fire({
            title: 'Confirmar operación',
            text: '¿Desea eliminar la carpeta "'+this.folder.cod_carpeta+'"?',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No, Cancelar'
          }).then((result) => {
            if (result.value) {
              this.spinner.show();
              this.folderService.deleteElement(id).toPromise().then(
                response => {
                  if(response!=undefined && response.data){
                    this.spinner.hide();
                    this.folders=this.folders.filter(element=>{
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
          })
          
        }
        /* liberar a venta (abre modal) */
        releaseForSaleForm(folder:Folder,content:any){
          this.folder=folder;
          this.modalRef=this.modalService.open(content);
        }
        releaseForSale(){       
         this.spinner.show();
          this.folderService.releaseForSale(this.folder.id,{
            date_released_sale:moment.utc(this.dateReleasedSale).format("YYYY-MM-DDTHH:mm:ss.SSS")
          }).toPromise().then(
            response => {
              if(response!=undefined && response.data){
                this.folders=this.folders.map(element=>{
                  return element.id==response.data.id?response.data:element;
                })
                this.spinner.hide();
                this.modalRef.close();
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
        /*cierra modal*/
        closeModal(){
          this.modalRef.close();
          this.setDefaultValues();
        }
        /* carga de valores por defecto */ 
        setDefaultValues(){
          this.folder=new Folder();
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
              case "type":
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
                break;
              default:
                // code...
                break;
            }
          }
          /*obtencion de formato de fecha*/ 
          formatDate(date:any){
            return moment.utc(date).format("YYYY-MM-DD")
          }
          /*generacion de reporte en excel*/
          generateReport(){
             this.data=new Array();
             for(let folder of this.folders){
                this.data.push({
                  cod_carpeta: folder.cod_carpeta,
                  status: folder.status,
                  type: folder.type,
                  inicio: this.formatDate(folder.created_at),
                  cierre: folder.closed_at?this.formatDate(folder.closed_at):'La carpeta no ha sido cerrada',
                });
             }     
            this.exportAsExcelFile(this.data, 'listado-carpetas');
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
  selectFolder(folder:Folder){
    this.folder=folder;
    this.products=this.folder.products;
    // .map(p=>{
    //   p.product_invoice=p.product_invoice.map(i=>{
    //     i.factura=folder.facturas.find(f => f.id == i.id_factura)
    //     return i;
    //   })
    //   return p;
    // });
  }
  ngOnDestroy() {
  }
}