import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { Supplie } from "src/app/models/supplie";
import { SupplieVersion } from "src/app/models/supplie-version";
import { SupplieService } from "src/app/services/supplie/supplie.service";
import { GroupService } from "src/app/services/group/group.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { groupConfigObj } from "./selectsconfigs/configs";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "app-supplies",
  templateUrl: "supplies.component.html",
  styleUrls: ['./supplies.component.scss']
})
export class SuppliesComponent implements OnInit, OnDestroy {  
  public groupConfig:any = groupConfigObj;
  public groups:any[]=[];
  public groupSelected:number=null;

  public modalRef:any=null;
  public supplies:Supplie[]=[];
  public supplie:Supplie=new Supplie();
  public suppliesVersions:SupplieVersion[]=[];
  // Subida de imagenes
  public fileData: File = null;
  public fileDataValidator: boolean = false;
  public previewUrl: any = null;
  public fileUploadProgress: string = null;
  public uploadedFilePath: string = null;
  public formData = new FormData();
  public versionProductImagen:string=null;
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //sort 
  public highestToLowest: any={
    cod_interno:false,
    cod_sap:false,
    descriptions:false,
    group_descriptions:false,
    tamano:false,
    inventariado:false,
    informar:false,
    comprar:false,
  };
  //excel file
  public data: Array<any>=null;
  constructor(
    public supplieService:SupplieService,
    public groupService:GroupService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService,
    public router: Router  ) {
  }

  ngOnInit() {
    this.setDefaultValues();
    this.getGroups();
    this.getSupplies();
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
          }).catch(error => {        
            this.spinner.hide();
            console.log("error:",error)
          });
        }  
        /* obtencion de datos de formulario */ 
        getFormData() {
          this.formData.append("id_grupo", `${this.supplie.id_grupo}`); 
          this.formData.append("cod_interno", `${this.supplie.cod_interno}`); 
          if(this.supplie.cod_sap)
            this.formData.append("cod_sap", `${this.supplie.cod_sap}`);   
          this.formData.append("descriptions", `${this.supplie.descriptions}`); 
          if(this.supplie.en_transito)
            this.formData.append("en_transito", `${this.supplie.en_transito}`);  
          this.formData.append("tamano", `${this.supplie.tamano}`);      
          this.formData.append("inventariado", `${this.supplie.inventariado}`);
          this.formData.append("generico_especifico", `${this.supplie.generico_especifico}`);
          this.formData.append("informar", `${this.supplie.informar}`);
          this.formData.append("comprar", `${this.supplie.comprar}`);
          if(this.supplie.imagen)
            this.formData.append("imagen", this.supplie.imagen);
          return this.formData;
        }
        /* registra o actualiza elemento */ 
        register(){
          if(this.supplie.id){
            this.spinner.show();
            this.supplieService.updateElement(this.supplie.id,this.getFormData()).toPromise().then(
              response => {
                if(response!=undefined && response.data){
                  this.supplies=this.supplies.map(element=>{
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
              this.supplieService.create(this.getFormData()).toPromise().then(
                response => {
                  if(response!=undefined && response.data){
                    this.spinner.hide();
                    this.supplies.push(response.data)
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
              this.supplie=this.supplies.find(element=>{
                return element.id==id?element:null
              })
              Swal.fire({
                title: 'Confirmar operación',
                text: '¿Desea eliminar el insumo "'+this.supplie.descriptions+'"?',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'No, Cancelar'
              }).then((result) => {
                if (result.value) {
                  this.spinner.show();
                  this.supplieService.deleteElement(id).toPromise().then(
                    response => {
                      if(response!=undefined && response.data){
                        this.spinner.hide();
                        this.supplies=this.supplies.filter(element=>{
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
            /*edicion de elementos*/
            edit(supplie:Supplie,content:any){
              this.supplie=Object.assign({},supplie);
              this.previewUrl=this.supplie.imagen;
              this.groupSelected=this.groups.find(element=>{
                return element.id==this.supplie.id_grupo;
              });
              this.modalRef=this.modalService.open(content,{size: 'lg'});
            }
            /*abre modal*/
            open(content) {
              this.setDefaultValues();
              this.modalRef=this.modalService.open(content,{size: 'lg'});
            }
            /* detector de cambio cambio en select */ 
            selectionChanged(event:any,element:string){
              switch (element) {
                case "grupo":
                this.supplie.id_grupo=event.value?event.value.id:null;
                break;
                default:
                // code...
                break;
              }
            }
            radioCheck(element:string,value:number){
              switch (element) {
                case "inventariable":
                this.supplie.inventariado=value;
                break;
                case "informa":
                this.supplie.informar=value;
                break;
                case "compra":
                this.supplie.comprar=value;
                break;
                case "generico_especifico":
                this.supplie.generico_especifico=value;
                break;
                default:
                // code...
                break;
              }
            }
            /* carga de valores por defecto */ 
            setDefaultValues(){
              this.supplie=new Supplie();            
              this.supplie.imagen=null;
              this.supplie.inventariado=1;
              this.supplie.informar=1;
              this.supplie.comprar=1;
              this.groupSelected=null;
              this.previewUrl=null;
              this.fileData=null;
              this.formData=new FormData();
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
                this.supplie.imagen=this.fileData;
              var reader = new FileReader();
              reader.readAsDataURL(this.fileData);
              reader.onload = _event => {
                this.previewUrl = reader.result;
              };
            }
  }
  /*ordenado de listado por orden alfabetico*/ 
  sortTableBy(element:string){
    switch (element) {
      case "cod_interno":
        if(this.highestToLowest.cod_interno){
          this.supplies=this.supplies.sort((a, b) => {
            if (a.cod_interno.toLowerCase() > b.cod_interno.toLowerCase()) return 1;
            if (a.cod_interno.toLowerCase() < b.cod_interno.toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.supplies=this.supplies.sort((a, b) => {
            if (b.cod_interno.toLowerCase() > a.cod_interno.toLowerCase()) return 1;
            if (b.cod_interno.toLowerCase() < a.cod_interno.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.cod_interno=!this.highestToLowest.cod_interno;
        break;
      case "cod_sap":
        if(this.highestToLowest.cod_sap){
          this.supplies=this.supplies.sort((a, b) => {
            if (a.cod_sap.toLowerCase() > b.cod_sap.toLowerCase()) return 1;
            if (a.cod_sap.toLowerCase() < b.cod_sap.toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.supplies=this.supplies.sort((a, b) => {
            if (b.cod_sap.toLowerCase() > a.cod_sap.toLowerCase()) return 1;
            if (b.cod_sap.toLowerCase() < a.cod_sap.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.cod_sap=!this.highestToLowest.cod_sap;
        break;
      case "descriptions":
        if(this.highestToLowest.descriptions){
          this.supplies=this.supplies.sort((a, b) => {
            if (a.descriptions.toLowerCase() > b.descriptions.toLowerCase()) return 1;
            if (a.descriptions.toLowerCase() < b.descriptions.toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.supplies=this.supplies.sort((a, b) => {
            if (b.descriptions.toLowerCase() > a.descriptions.toLowerCase()) return 1;
            if (b.descriptions.toLowerCase() < a.descriptions.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.descriptions=!this.highestToLowest.descriptions;
        break;
      case "group_descriptions":
        if(this.highestToLowest.group_descriptions){
          this.supplies=this.supplies.sort((a, b) => {
            if (a.group.descriptions.toLowerCase() > b.group.descriptions.toLowerCase()) return 1;
            if (a.group.descriptions.toLowerCase() < b.group.descriptions.toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.supplies=this.supplies.sort((a, b) => {
            if (b.group.descriptions.toLowerCase() > a.group.descriptions.toLowerCase()) return 1;
            if (b.group.descriptions.toLowerCase() < a.group.descriptions.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.group_descriptions=!this.highestToLowest.group_descriptions;
        break;
        case "tamano":
        if(this.highestToLowest.tamano){
          this.supplies=this.supplies.sort((a, b) => {
            if (a.tamano.toLowerCase() > b.tamano.toLowerCase()) return 1;
            if (a.tamano.toLowerCase() < b.tamano.toLowerCase()) return -1;
            return 0;
          });
        }else{
          this.supplies=this.supplies.sort((a, b) => {
            if (b.tamano.toLowerCase() > a.tamano.toLowerCase()) return 1;
            if (b.tamano.toLowerCase() < a.tamano.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.tamano=!this.highestToLowest.tamano;
        break;
      case "inventariado":
        if(this.highestToLowest.inventariado){
          this.supplies=this.supplies.sort((a, b) => {
            if (a.inventariado > b.inventariado) return 1;
            if (a.inventariado < b.inventariado) return -1;
            return 0;
          });
        }else{
          this.supplies=this.supplies.sort((a, b) => {
            if (b.inventariado > a.inventariado) return 1;
            if (b.inventariado < a.inventariado) return -1;
            return 0;
          });
        }
        this.highestToLowest.inventariado=!this.highestToLowest.inventariado;
        break;
      case "informar":
        if(this.highestToLowest.informar){
          this.supplies=this.supplies.sort((a, b) => {
            if (a.informar > b.informar) return 1;
            if (a.informar < b.informar) return -1;
            return 0;
          });
        }else{
          this.supplies=this.supplies.sort((a, b) => {
            if (b.informar > a.informar) return 1;
            if (b.informar < a.informar) return -1;
            return 0;
          });
        }
        this.highestToLowest.informar=!this.highestToLowest.informar;
        break;
      case "comprar":
        if(this.highestToLowest.comprar){
          this.supplies=this.supplies.sort((a, b) => {
            if (a.comprar > b.comprar) return 1;
            if (a.comprar < b.comprar) return -1;
            return 0;
          });
        }else{
          this.supplies=this.supplies.sort((a, b) => {
            if (b.comprar > a.comprar) return 1;
            if (b.comprar < a.comprar) return -1;
            return 0;
          });
        }
        this.highestToLowest.comprar=!this.highestToLowest.comprar;
        break;
      default:

      // code...
      break;
    }
  }
  /* generacion de reporte en excel */
  generateReport(){    
     this.data=new Array();
     for(let supplie of this.supplies){
        this.data.push({
          cod_interno: supplie.cod_interno,
          cod_sap: supplie.cod_sap,
          descriptions: supplie.descriptions,
          group:supplie.group.descriptions,
          tamano: supplie.tamano,
          inventariado:  supplie.inventariado==1?'Sí':'No',
          informar:  supplie.informar==1?'Sí':'No',
          comprar:  supplie.comprar==1?'Sí':'No'
        });
     }     
    this.exportAsExcelFile(this.data, 'listado-insumos');
        
  }
  /* exporta como archivo excel*/
  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  /*guardar como archivo excel*/
  private saveAsExcelFile(buffer: any, fileName: string): void {
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
     FileSaver.saveAs(data, fileName +new  Date()+EXCEL_EXTENSION);
  }
  /*abre modal de imagen*/
  openImage(content:any,image:string){
    this.versionProductImagen=image;
    this.modalRef=this.modalService.open(content);
  }
  /*muestra versiones*/
  showVersions(versions:any[]){
    this.suppliesVersions=versions;
    if(this.suppliesVersions.length>0){
      this.supplie=this.supplies.find(element=>{
        return element.id==this.suppliesVersions[0].id_insumo?element:null
      })
    }
  }  
  /*cierra tabla de versiones de insumos*/
  closeVesionSupplieTable(){
    this.suppliesVersions=[]
    this.supplie=new Supplie();
  }
  /*navegacion*/
  goToForm(id?:number){
    if (id) {
      this.router.navigate(["dashboards/supplies-versions","supplie",id]);
    }else{
      this.router.navigate(["dashboards/supplies-versions"]);
    }
  }
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  ngOnDestroy() {
  }

}
