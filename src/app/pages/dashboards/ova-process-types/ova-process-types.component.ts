import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { OVAProcessType } from "src/app/models/ova-process-type";
import { OVAProcessTypesService } from "src/app/services/ova-process-types/ova-process-types.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import * as moment from "moment";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "app-ova-process-types",
  templateUrl: "ova-process-types.component.html"
})
export class OvaProcessTypesComponent implements OnInit, OnDestroy {  
  public modalRef:any=null;
  public ovaProcessTypes:OVAProcessType[] = [];
  public ovaProcessType:OVAProcessType=null;
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //sort 
  public highestToLowest: any={
    operation_type:false,
    descriptions:false,
    activity_code:false
  };

  //excel file
  public data: Array<any>=null;
  constructor(
    public ovaProcessTypesService: OVAProcessTypesService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public spinner: NgxSpinnerService ) {
  }

  ngOnInit() {
    this.setDefaultValues();
    this.getOvaProcessTypes();
  } 

  /*obtencion listado de tipo de proceso ova*/ 
  getOvaProcessTypes(){
    this.spinner.show();
    this.ovaProcessTypesService.getAll().toPromise().then(
      response => {
        this.spinner.hide();
        this.ovaProcessTypes=response.data;
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
      if(this.ovaProcessType.id){
        this.spinner.show();
        this.ovaProcessTypesService.updateElement(this.ovaProcessType.id,this.ovaProcessType).toPromise().then(
          response => {
            this.ovaProcessTypes=this.ovaProcessTypes.map(element=>{
              return element.id==response.data.id?response.data:element;
            })
            this.spinner.hide();
            this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
            this.modalRef.close();  
            this.setDefaultValues();
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
          this.ovaProcessTypesService.create(this.ovaProcessType).toPromise().then(
            response => {
              this.ovaProcessTypes=this.ovaProcessTypes.map(element=>{
                return element.id==response.data.id?response.data:element;
              })
              this.spinner.hide();
              this.ovaProcessTypes.push(response.data)
              this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
              this.modalRef.close();
              this.setDefaultValues();
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
          this.ovaProcessType=this.ovaProcessTypes.find(element=>{
            return element.id==id?element:null
          })
            Swal.fire({
              title: 'Confirmar operación',
              text: '¿Desea eliminar el Tipo Proceso OVA "'+this.ovaProcessType.operation_type+'"?',
              showCancelButton: true,
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'No, Cancelar'
            }).then((result) => {
              if (result.value) {
                this.spinner.show();
                this.ovaProcessTypesService.deleteElement(id).toPromise().then(
                  response => {
                    this.spinner.hide();
                    this.ovaProcessTypes=this.ovaProcessTypes.filter(element=>{
                      if(element.id!=response.data.id){
                        return element
                      }
                    })
                    console.log("this.ova:",this.ovaProcessTypes)
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
          /*edicion de elemento*/
          edit(ovaProcessTypes:OVAProcessType,content:any){
            this.ovaProcessType=Object.assign({},ovaProcessTypes);
            this.modalRef=this.modalService.open(content);
          }
        /* carga de valores por defecto */ 
        setDefaultValues(){
          this.ovaProcessType=new OVAProcessType();
        }
        /*ordenado de listado por orden alfabetico*/ 
        sortTableBy(element:string){
            switch (element) {
              case "operation_type":
                  if(this.highestToLowest.operation_type){
                    this.ovaProcessTypes=this.ovaProcessTypes.sort((a, b) => {
                      if (a.operation_type.toLowerCase() > b.operation_type.toLowerCase()) return 1;
                      if (a.operation_type.toLowerCase() < b.operation_type.toLowerCase()) return -1;
                      return 0;
                    });
                  }else{
                    this.ovaProcessTypes=this.ovaProcessTypes.sort((a, b) => {
                      if (b.operation_type.toLowerCase() > a.operation_type.toLowerCase()) return 1;
                      if (b.operation_type.toLowerCase() < a.operation_type.toLowerCase()) return -1;
                      return 0;
                    });
                  }
                  this.highestToLowest.operation_type=!this.highestToLowest.operation_type;
                break;
              case "descriptions":
                  if(this.highestToLowest.descriptions){
                    this.ovaProcessTypes=this.ovaProcessTypes.sort((a, b) => {
                      if (a.descriptions.toLowerCase() > b.descriptions.toLowerCase()) return 1;
                      if (a.descriptions.toLowerCase() < b.descriptions.toLowerCase()) return -1;
                      return 0;
                    });
                  }else{
                    this.ovaProcessTypes=this.ovaProcessTypes.sort((a, b) => {
                      if (b.descriptions.toLowerCase() > a.descriptions.toLowerCase()) return 1;
                      if (b.descriptions.toLowerCase() < a.descriptions.toLowerCase()) return -1;
                      return 0;
                    });
                  }
                  this.highestToLowest.descriptions=!this.highestToLowest.descriptions;
                break;
              case "activity_code":
                  if(this.highestToLowest.activity_code){
                    this.ovaProcessTypes=this.ovaProcessTypes.sort((a, b) => {
                      if (a.activity_code.toLowerCase() > b.activity_code.toLowerCase()) return 1;
                      if (a.activity_code.toLowerCase() < b.activity_code.toLowerCase()) return -1;
                      return 0;
                    });
                  }else{
                    this.ovaProcessTypes=this.ovaProcessTypes.sort((a, b) => {
                      if (b.activity_code.toLowerCase() > a.activity_code.toLowerCase()) return 1;
                      if (b.activity_code.toLowerCase() < a.activity_code.toLowerCase()) return -1;
                      return 0;
                    });
                  }
                  this.highestToLowest.activity_code=!this.highestToLowest.activity_code;
                break;
              default:
                // code...
                break;
            }
          }
    /*generacion de reporte en excel*/    
    generateReport(){
      this.data=new Array();
      for(let ovaProcessType of this.ovaProcessTypes){
        this.data.push({
          operation_type: ovaProcessType.operation_type,
          descriptions: ovaProcessType.descriptions,
          activity_code: ovaProcessType.activity_code,
        });
      }     
      this.exportAsExcelFile(this.data, 'listado-procesos-ova');
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
