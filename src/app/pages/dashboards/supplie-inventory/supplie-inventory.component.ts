import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { Supplie } from "src/app/models/supplie";
import { SupplieInventory } from "src/app/models/supplie-inventory";
import { SupplieVersion } from "src/app/models/supplie-version";
import { SupplieService } from "src/app/services/supplie/supplie.service";
import { SupplieInventoryService } from "src/app/services/supplie-inventory/supplie-inventory.service";
import { GroupService } from "src/app/services/group/group.service";
import { VersionInsumoService } from "src/app/services/version-insumo/version-insumo.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { supplieConfigObj, supplieVersionConfigObj } from "./selectsconfigs/configs";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "app-supplie-inventory",
  templateUrl: "supplie-inventory.component.html",
  styleUrls: ["./supplie-inventory.component.scss"]
})
export class SupplieInventoryComponent implements OnInit, OnDestroy {  
  public supplieConfig:any = supplieConfigObj;
  public supplieVersionConfig:any = supplieVersionConfigObj;
  public supplies:Supplie[]=[];
  public supplieSelected:Supplie=null;
  public supplieVersionSelected:SupplieVersion=null;
  public modalRef:any=null;
  public suppliesInventory:SupplieInventory[]=[];
  public supplieInventory:SupplieInventory=null;
  public suppliesVersions:SupplieVersion[]=[];
  public movement:string=null;
  public nameFile:string='Subir Archivo';
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //sort 
  public highestToLowest: any={
    cod_interno:false,
    cod_sap:false,
    descriptions:false,
    cantidad:false,
    version_insumo:false
  };

  public formData = new FormData();

  //pdf
  public fileData: File = null;
  //excel file
  public data: Array<any>=null;

  constructor(
    public supplieService: SupplieService,
    public supplieInventoryService: SupplieInventoryService,
    public groupService: GroupService,
    public versionInsumoService: VersionInsumoService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService ) {
  }

  ngOnInit() {
    this.setDefaultValues();
    this.getSupplies();
    this.getSuppliesInventory();
  } 
  /* obtencion de listado de insumos */
  getSupplies(){
    this.spinner.show();
    this.supplieService.getAll().toPromise().then(response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.supplies=response.data.filter(element=>{
            if(element.inventariado!=0 && element.generico_especifico!=1){
              return element;
            }
          });
        }
      }).catch(error => {        
        this.spinner.hide();
        console.log("error:",error)
      });
    } 
    /*obtiene inventario de insumos*/
    getSuppliesInventory(){
      this.spinner.show();
      this.supplieInventoryService.getAll().toPromise().then(
        response => {
          if(response!=undefined && response.data){
            this.spinner.hide();
            this.suppliesInventory=response.data;
          }
        }
        ).catch( 
        error => {
          this.spinner.hide();
          console.log("error:",error)
        }
        );
      }  
      
      /* registra o actualiza elemento */ 
      register(){
        this.supplieInventory.movement=this.movement;
        const user= JSON.parse(localStorage.getItem("user")).user;
        this.supplieInventory.id_user=user.id
        this.supplieInventory.movement=this.movement;

        if(this.supplieInventory.id){
          this.spinner.show();
          this.supplieInventoryService.updateElement(this.supplieInventory.id,this.getFormData()).toPromise().then(
            response => {
              if(response!=undefined && response.data){
                this.suppliesInventory=this.suppliesInventory.map(element=>{
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
            this.supplieInventoryService.create(this.getFormData()).toPromise().then(
              response => {
                if(response!=undefined && response.data){   
                  this.spinner.hide();
                  if(this.suppliesInventory.find(element=>{
                    return element.id==response.data.id;
                  })!=undefined){
                    this.suppliesInventory=this.suppliesInventory.map(element=>{
                      return element.id==response.data.id?response.data:element;
                    });
                  }else{
                    this.suppliesInventory.push(response.data)
                  }
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

          /* obtencion de datos de formulario */ 
          getFormData(){
            this.formData.append("id_insumo", `${this.supplieInventory.id_insumo}`); 
            this.formData.append("id_version_insumo", `${this.supplieInventory.id_version_insumo}`);
            this.formData.append("movement", `${this.supplieInventory.movement}`);
            this.formData.append("doc_origen", `${this.supplieInventory.doc_origen}`);
            this.formData.append("observations", `${this.supplieInventory.observations}`);
            this.formData.append("cantidad", `${this.supplieInventory.cantidad}`);
            this.formData.append("id_user", `${this.supplieInventory.id_user}`);
            this.formData.append("pdf", this.fileData);
            return this.formData;
          }
          fileProgress(fileInput: any) {
            this.fileData = <File>fileInput.target.files[0];
            this.nameFile = this.fileData.name;
          }
          /* eliminacion de elemento por id */ 
          delete(id:number){
            this.supplieInventory=this.suppliesInventory.find(element=>{
              return element.id==id?element:null
            })
            Swal.fire({
              title: 'Confirmar operación',
              text: '¿Desea eliminar el inventario de insumo de "'+this.supplieInventory.cantidad+'" "'+this.supplieInventory.movement+'" ?',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'No, Cancelar'
            }).then((result) => {
              if (result.value) {
                this.spinner.show();
                this.supplieInventoryService.deleteElement(id).toPromise().then(
                  response => {
                    this.spinner.hide();
                    this.suppliesInventory=this.suppliesInventory.filter(element=>{
                      if(element.id!=response.data.id){
                        return element
                      }
                    })
                    this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
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
          /*edicion de elementos*/
          edit(supplieInventory:SupplieInventory,content:any){
            this.supplieInventory=Object.assign({},supplieInventory);
            this.supplieSelected=this.supplies.find(element=>{
              return element.id==this.supplieInventory.id_insumo;
            });
            this.modalRef=this.modalService.open(content,{size: 'lg'});
          }
          /*abre modal*/
          open(content:any,movement:string) {
            this.setDefaultValues();
            this.movement=movement;
            this.modalRef=this.modalService.open(content,{size: 'lg'});
          }
          /* detector de cambio cambio en select */ 
          selectionChanged(event:any,element:string){
            switch (element) {
              case "insumo":
                this.supplieInventory.id_insumo=event.value?event.value.id:null;
                if(this.supplieInventory.id_insumo){                
                  const supplie=this.supplies.find(element=>{
                    if(element.id==this.supplieInventory.id_insumo){
                      return element;
                    }
                  })
                  this.suppliesVersions=supplie.versions;
                }else{
                  this.suppliesVersions=[];
                }
              break;
              case "version_insumo":
                this.supplieInventory.id_version_insumo=event.value?event.value.id:null;
              break;
              default:
              // code...
              break;
            }
          }
          /* carga de valores por defecto */ 
          setDefaultValues(){
            this.supplieInventory=new SupplieInventory();
            this.formData=new FormData();
            this.movement=null;
            this.supplieSelected=null;
            this.supplieVersionSelected=null;
          }
          /*ordenado de listado por orden alfabetico*/ 
          sortTableBy(element:string){
            switch (element) {
              case "cod_interno":
              if(this.highestToLowest.cod_interno){
                this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                  if (a.insumo.cod_interno.toLowerCase() > b.insumo.cod_interno.toLowerCase()) return 1;
                  if (a.insumo.cod_interno.toLowerCase() < b.insumo.cod_interno.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                  if (b.insumo.cod_interno.toLowerCase() > a.insumo.cod_interno.toLowerCase()) return 1;
                  if (b.insumo.cod_interno.toLowerCase() < a.insumo.cod_interno.toLowerCase()) return -1;
                  return 0;
                });
              }
              this.highestToLowest.cod_interno=!this.highestToLowest.cod_interno;
              break;
              case "cod_sap":
              if(this.highestToLowest.cod_sap){
                this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                  if (a.insumo.cod_sap.toLowerCase() > b.insumo.cod_sap.toLowerCase()) return 1;
                  if (a.insumo.cod_sap.toLowerCase() < b.insumo.cod_sap.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                  if (b.insumo.cod_sap.toLowerCase() > a.insumo.cod_sap.toLowerCase()) return 1;
                  if (b.insumo.cod_sap.toLowerCase() < a.insumo.cod_sap.toLowerCase()) return -1;
                  return 0;
                });
              }
              this.highestToLowest.cod_sap=!this.highestToLowest.cod_sap;
              break;
              case "descriptions":
              if(this.highestToLowest.descriptions){
                this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                  if (a.insumo.descriptions.toLowerCase() > b.insumo.descriptions.toLowerCase()) return 1;
                  if (a.insumo.descriptions.toLowerCase() < b.insumo.descriptions.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                  if (b.insumo.descriptions.toLowerCase() > a.insumo.descriptions.toLowerCase()) return 1;
                  if (b.insumo.descriptions.toLowerCase() < a.insumo.descriptions.toLowerCase()) return -1;
                  return 0;
                });
              }
              this.highestToLowest.descriptions=!this.highestToLowest.descriptions;
              break;
              case "tamano":
              if(this.highestToLowest.tamano){
                this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                  if (a.insumo.tamano.toLowerCase() > b.insumo.tamano.toLowerCase()) return 1;
                  if (a.insumo.tamano.toLowerCase() < b.insumo.tamano.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                  if (b.insumo.tamano.toLowerCase() > a.insumo.tamano.toLowerCase()) return 1;
                  if (b.insumo.tamano.toLowerCase() < a.insumo.tamano.toLowerCase()) return -1;
                  return 0;
                });
              }
              this.highestToLowest.tamano=!this.highestToLowest.tamano;
              break;
              
              case "cantidad":
              if(this.highestToLowest.cantidad){
                this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                  if (a.cantidad > b.cantidad) return 1;
                  if (a.cantidad < b.cantidad) return -1;
                  return 0;
                });
              }else{
                this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                  if (b.cantidad > a.cantidad) return 1;
                  if (b.cantidad < a.cantidad) return -1;
                  return 0;
                });
              }
              this.highestToLowest.cantidad=!this.highestToLowest.cantidad;
              break;
              case "version_insumo":
                if(this.highestToLowest.version_insumo){
                  this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                    if (a.version_insumo.nombre.toLowerCase() > b.version_insumo.nombre.toLowerCase()) return 1;
                    if (a.version_insumo.nombre.toLowerCase() < b.version_insumo.nombre.toLowerCase()) return -1;
                    return 0;
                  });
                }else{
                  this.suppliesInventory=this.suppliesInventory.sort((a, b) => {
                    if (b.version_insumo.nombre.toLowerCase() > a.version_insumo.nombre.toLowerCase()) return 1;
                    if (b.version_insumo.nombre.toLowerCase() < a.version_insumo.nombre.toLowerCase()) return -1;
                    return 0;
                  });
                }
                this.highestToLowest.version_insumo=!this.highestToLowest.version_insumo;
              break;
              
              default:
              break;
            }
          }
          /*generacion de reporte en excel*/
          generateReport(){
             this.data=new Array();
             for(let supplieInventory of this.suppliesInventory){
                this.data.push({
                  cod_interno_insumo:supplieInventory.insumo?supplieInventory.insumo.cod_interno:'Sin insumo',
                  cod_sap_insumo:supplieInventory.insumo?supplieInventory.insumo.cod_sap:'Sin insumo',
                  descriptions_insumo:supplieInventory.insumo?supplieInventory.insumo.descriptions:'Sin insumo',
                  tamano_insumo:supplieInventory.insumo?supplieInventory.insumo.tamano:'Sin insumo',
                  cantidad:supplieInventory.cantidad?supplieInventory.cantidad:'Sin cantidad',
                  version_insumo:supplieInventory.version_insumo?supplieInventory.version_insumo.nombre:'Sin versión de insumo',
                });
             }     
            this.exportAsExcelFile(this.data, 'listado-supplies-inventory');
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
          ngOnDestroy() {
          }

        }
