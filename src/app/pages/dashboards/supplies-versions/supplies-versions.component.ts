import { Component, OnInit, OnDestroy, AfterViewInit, TemplateRef, ViewChild } from "@angular/core";
import {  ActivatedRoute,  Router } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { SupplieVersion } from "src/app/models/supplie-version";
import { SupplieVersionService } from "src/app/services/supplie-version/supplie-version.service";
import { SupplieService } from "src/app/services/supplie/supplie.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { supplieConfigObj } from "./selectsconfigs/configs";

//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "app-supplies-versions",
  templateUrl: "supplies-versions.component.html",
  styleUrls: ['./supplies-versions.component.scss']
})
export class SuppliesVersionsComponent implements OnInit, OnDestroy, AfterViewInit {  
  @ViewChild('formElement')
  private formElement: TemplateRef<any>;
  public supplieConfig:any = supplieConfigObj;
  public supplies:any[]=[];
  public supplieSelected:any=null;
  public selectDisabled:boolean=false;

  public modalRef:any=null;
  public suppliesVersions:SupplieVersion[]=[];
  public supplieVersion:SupplieVersion=new SupplieVersion();  
  // Subida de imagenes
  public fileData: File = null;
  public fileDataValidator: boolean = false;
  public previewUrl: any = null;
  public fileUploadProgress: string = null;
  public uploadedFilePath: string = null;
  public formData = new FormData();
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //sort 
  public highestToLowest: any={
    name:false,
    supplie:false
  };
  //detalle de imagen
  public supplieVersionImagen:string=null;
  //excel file
  public data: Array<any>=null;
  constructor(
    public supplieVersionService:SupplieVersionService,
    public supplieService:SupplieService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public toastr: ToastrService,
    public spinner: NgxSpinnerService,
    public route:ActivatedRoute) {
  }

  ngOnInit() {
    this.getSupplieVersions();
  }
  ngAfterViewInit(){
    this.getSupplies();
  }

  /* obtencion de listado de insumos */ 
  getSupplies(){
    this.spinner.show();
    this.supplieService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.supplies=response.data.filter(element=>{
            if(element.generico_especifico!=1){//generico
              return element;
            }
          });
          this.verifyEditElement();
        }
      }).catch(error => {        
        this.spinner.hide();
        console.log("error:",error)
      });
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
      this.setDefaultValues();
      this.modalRef=this.modalService.open(content);
    }
    /* obtencion de datos de formulario */ 
    getFormData() {
      this.formData.append("nombre", `${this.supplieVersion.nombre}`); 
      this.formData.append("id_insumo", `${this.supplieVersion.id_insumo}`); 
      this.formData.append("imagen", this.supplieVersion.imagen);
      return this.formData;
    }
    /* registra o actualiza elemento */ 
    register(){
      if(this.supplieVersion.id){
        this.spinner.show();
        this.supplieVersionService.updateElement(this.supplieVersion.id,this.getFormData()).toPromise().then(
          response => {
            if(response!=undefined && response.data){
              this.suppliesVersions=this.suppliesVersions.map(element=>{
                return element.id==response.data.id?response.data:element;
              })
              this.spinner.hide();
              this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
              this.modalRef.close();
              this.setDefaultValues();
            }
          }).catch(error => {
            this.spinner.hide();
            if(error.error)
            this.notificationService.showError('Error',error.error) 
          });      
        } 
        else{
          this.spinner.show();
          this.supplieVersionService.create(this.getFormData()).toPromise().then(
            response => {
              if(response!=undefined && response.data){
                this.spinner.hide();
                this.suppliesVersions.push(response.data)
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
        edit(supplieVersion:SupplieVersion,content:any){
          this.supplieVersion=Object.assign({},supplieVersion);
          this.previewUrl=this.supplieVersion.imagen;
          this.modalRef=this.modalService.open(content);
        }
        /* eliminacion de elemento por id */ 
        delete(id:number){
          this.supplieVersion=this.suppliesVersions.find(element=>{
            return element.id==id?element:null
          })

          Swal.fire({
            title: 'Confirmar operación',
            text: '¿Dese eliminar la versión de insumo "'+this.supplieVersion.nombre+'"?',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No, Cancelar'
          }).then((result) => {
            if (result.value) {
              this.spinner.show();
              this.supplieVersionService.deleteElement(id).toPromise().then(
                response => {
                  if(response!=undefined && response.data){
                    this.spinner.hide();
                    this.suppliesVersions=this.suppliesVersions.filter(element=>{                    
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
            this.setDefaultValues();

        }
        /* carga de valores por defecto */ 
        setDefaultValues(){
          this.previewUrl=null;
          this.supplieSelected=null;
          this.selectDisabled=false;
          this.supplieVersion=new SupplieVersion();
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
            this.supplieVersion.imagen=this.fileData;
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
          case "name":
            if(this.highestToLowest.name){
              this.suppliesVersions=this.suppliesVersions.sort((a, b) => {
                if (a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1;
                if (a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.suppliesVersions=this.suppliesVersions.sort((a, b) => {
                if (b.nombre.toLowerCase() > a.nombre.toLowerCase()) return 1;
                if (b.nombre.toLowerCase() < a.nombre.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.name=!this.highestToLowest.name;
            break;
          case "supplie":
            if(this.highestToLowest.supplie){
              this.suppliesVersions=this.suppliesVersions.sort((a, b) => {
                if (a.insumo.descriptions.toLowerCase() > b.insumo.descriptions.toLowerCase()) return 1;
                if (a.insumo.descriptions.toLowerCase() < b.insumo.descriptions.toLowerCase()) return -1;
                return 0;
              });
            }else{
              this.suppliesVersions=this.suppliesVersions.sort((a, b) => {
                if (b.insumo.descriptions.toLowerCase() > a.insumo.descriptions.toLowerCase()) return 1;
                if (b.insumo.descriptions.toLowerCase() < a.insumo.descriptions.toLowerCase()) return -1;
                return 0;
              });
            }
            this.highestToLowest.supplie=!this.highestToLowest.supplie;
            break;
          default:
          break;
        }
      }
      /*abre modal de imagen*/
      openImage(content:any,image:string){
        this.supplieVersionImagen=image;
        this.modalRef=this.modalService.open(content);
      }
      /*verfica si ele elemento se va a editar por parametros*/
      verifyEditElement(){
          if(this.route.snapshot.paramMap.get('id')){
            switch (this.route.snapshot.paramMap.get('element')) {
              case "supplie":
                this.setDefaultValues();
                this.modalRef = this.modalService.open(this.formElement);
                this.selectDisabled=true;
                this.getSupplie();
                break;
              default:
                // code...
                break;
            }            
          }
        }
        /*obtiene insumo*/
        getSupplie(){
          this.supplieSelected=this.supplies.find(element=>{
            return element.id==parseInt(this.route.snapshot.paramMap.get('id'));
          });
          this.supplieVersion.id_insumo=this.supplieSelected?this.supplieSelected.id:null
        }
        /* detector de cambio cambio en select */ 
        selectionChanged(event:any,element:string){
          switch (element) {
            case "supplie":
            this.supplieVersion.id_insumo=event.value?event.value.id:null;
            break;
            default:
            // code...
            break;
          }
        }
        /*cierra el modal del formulario*/
        closeFormModal(){
          this.modalRef.close();
          this.selectDisabled=false;
        }
        /* generacion de reporte en excel */
  generateReport(){    
     this.data=new Array();
     for(let supplieVersion of this.suppliesVersions){
        this.data.push({
          nombre: supplieVersion.nombre,
          descripcion_inusmo: supplieVersion.insumo?supplieVersion.insumo.descriptions:'Sin insumo',
        });
     }     
    this.exportAsExcelFile(this.data, 'listado-version-insumos');
        
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
      ngOnDestroy() {
      }

    }
