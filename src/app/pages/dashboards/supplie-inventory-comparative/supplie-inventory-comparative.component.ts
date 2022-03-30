import { Component, OnInit, OnDestroy } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import { NotificationService } from "src/app/services/notification/notification.service";
import { SupplieInventoryComparativeService } from "src/app/services/supplie-inventory-comparative/supplie-inventory-comparative.service";
import { SupplieInventoryComparative } from "src/app/models/supplie-inventory-comparative";
import Swal from "sweetalert2";
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: "app-supplie-inventory-comparative",
  templateUrl: "supplie-inventory-comparative.component.html",
})
export class SupplieInventoryComparativeComponent implements OnInit, OnDestroy {  
  public suppliesInventoryComparative:SupplieInventoryComparative[]=[];
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
    version_insumo:false,
    cantidad_sap:false,
    difference_quantities:false
  };
  //excel file
  public data: Array<any>=null;
  constructor(
    public toastr: ToastrService,
    public spinner: NgxSpinnerService,
    public supplieInventoryComparativeService:SupplieInventoryComparativeService, 
    public notificationService: NotificationService,) {
  }

  ngOnInit() {
    this.getComparative();
  } 
  /* obtencion de listado de comparaciones */ 
    getComparative(){
      this.spinner.show();
      this.supplieInventoryComparativeService.getAll().toPromise().then(
        response => {
         if(response!=undefined && response.data){
            this.spinner.hide();
            this.suppliesInventoryComparative=response.data.local.map(local=>{
              const apiValue=response.data.api.find(api=>{if(api.id==local.insumo.cod_sap) return api});
              const cantidad_sap=apiValue!=undefined?apiValue.quantity:0;
              return {
                supplie_inventory:local,
                cantidad_sap:cantidad_sap,
                difference_quantities:local.cantidad-cantidad_sap
              }
            });
          }
        }
        ).catch( 
        error => {
          this.spinner.hide();
          console.log("error:",error)
        });
    }
    confirmSendReport(){
            Swal.fire({
              title: 'Confirmar operación',
              text: 'Estás seguro en enviar reporte?',
              showCancelButton: true,
              confirmButtonText: 'Sí, enviar',
              cancelButtonText: 'No, Cancelar'
            }).then((result) => {
              if (result.value) {                
                this.sendReport();
              }

          });
    }
    sendReport(){
      let filterData=this.suppliesInventoryComparative.filter(element=>{
        if(element.difference_quantities!=0){
          return element;
        }
      });
      let mapData=filterData.map(element=>{
        return {
          supplie_inventory_id:element.supplie_inventory.id,
          cantidad_sap:element.cantidad_sap,
          difference_quantities:element.difference_quantities
        }
      })
      this.spinner.show();
      this.supplieInventoryComparativeService.sendReport(mapData).toPromise().then(
        response => {
          if(response!=undefined && response.data){
            this.spinner.hide();
            this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
          }
        }
        ).catch( 
        error => {
          this.spinner.hide();
          console.log("error:",error)
        });
    }
    /*generacion de reporte en excel*/
          generateReport(){
             this.data=new Array();
             for(let data of this.suppliesInventoryComparative){
                this.data.push({
                  cod_interno:data.supplie_inventory.insumo.cod_interno,
                  cod_sap:data.supplie_inventory.insumo.cod_sap!=undefined?data.supplie_inventory.insumo.cod_sap:'Sin código',
                  descriptions:data.supplie_inventory.insumo.descriptions,
                  version_insumo:data.supplie_inventory.version_insumo.nombre,
                  tamano:data.supplie_inventory.insumo.tamano,
                  cantidad:data.supplie_inventory.cantidad,
                  cantidad_sap:data.cantidad_sap,
                  difference_quantities:data.difference_quantities
                });
             }     
            this.exportAsExcelFile(this.data, 'listado-comparativa-sap');
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
    /*ordenado de listado por orden alfabetico*/ 
          sortTableBy(element:string){
            switch (element) {
              case "cod_interno":
              if(this.highestToLowest.cod_interno){
                this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                  if (a.supplie_inventory.insumo.cod_interno.toLowerCase() > b.supplie_inventory.insumo.cod_interno.toLowerCase()) return 1;
                  if (a.supplie_inventory.insumo.cod_interno.toLowerCase() < b.supplie_inventory.insumo.cod_interno.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                  if (b.supplie_inventory.insumo.cod_interno.toLowerCase() > a.supplie_inventory.insumo.cod_interno.toLowerCase()) return 1;
                  if (b.supplie_inventory.insumo.cod_interno.toLowerCase() < a.supplie_inventory.insumo.cod_interno.toLowerCase()) return -1;
                  return 0;
                });
              }
              this.highestToLowest.cod_interno=!this.highestToLowest.cod_interno;
              break;
              case "cod_sap":
              if(this.highestToLowest.cod_sap){
                this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                  if (a.supplie_inventory.insumo.cod_sap.toLowerCase() > b.supplie_inventory.insumo.cod_sap.toLowerCase()) return 1;
                  if (a.supplie_inventory.insumo.cod_sap.toLowerCase() < b.supplie_inventory.insumo.cod_sap.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                  if (b.supplie_inventory.insumo.cod_sap.toLowerCase() > a.supplie_inventory.insumo.cod_sap.toLowerCase()) return 1;
                  if (b.supplie_inventory.insumo.cod_sap.toLowerCase() < a.supplie_inventory.insumo.cod_sap.toLowerCase()) return -1;
                  return 0;
                });
              }
              this.highestToLowest.cod_sap=!this.highestToLowest.cod_sap;
              break;
              case "descriptions":
              if(this.highestToLowest.descriptions){
                this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                  if (a.supplie_inventory.insumo.descriptions.toLowerCase() > b.supplie_inventory.insumo.descriptions.toLowerCase()) return 1;
                  if (a.supplie_inventory.insumo.descriptions.toLowerCase() < b.supplie_inventory.insumo.descriptions.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                  if (b.supplie_inventory.insumo.descriptions.toLowerCase() > a.supplie_inventory.insumo.descriptions.toLowerCase()) return 1;
                  if (b.supplie_inventory.insumo.descriptions.toLowerCase() < a.supplie_inventory.insumo.descriptions.toLowerCase()) return -1;
                  return 0;
                });
              }
              this.highestToLowest.descriptions=!this.highestToLowest.descriptions;
              break;
              case "tamano":
              if(this.highestToLowest.tamano){
                this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                  if (a.supplie_inventory.insumo.tamano.toLowerCase() > b.supplie_inventory.insumo.tamano.toLowerCase()) return 1;
                  if (a.supplie_inventory.insumo.tamano.toLowerCase() < b.supplie_inventory.insumo.tamano.toLowerCase()) return -1;
                  return 0;
                });
              }else{
                this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                  if (b.supplie_inventory.insumo.tamano.toLowerCase() > a.supplie_inventory.insumo.tamano.toLowerCase()) return 1;
                  if (b.supplie_inventory.insumo.tamano.toLowerCase() < a.supplie_inventory.insumo.tamano.toLowerCase()) return -1;
                  return 0;
                });
              }
              this.highestToLowest.tamano=!this.highestToLowest.tamano;
              break;
              
              case "cantidad":
              if(this.highestToLowest.cantidad){
                this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                  if (a.supplie_inventory.cantidad > b.supplie_inventory.cantidad) return 1;
                  if (a.supplie_inventory.cantidad < b.supplie_inventory.cantidad) return -1;
                  return 0;
                });
              }else{
                this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                  if (b.supplie_inventory.cantidad > a.supplie_inventory.cantidad) return 1;
                  if (b.supplie_inventory.cantidad < a.supplie_inventory.cantidad) return -1;
                  return 0;
                });
              }
              this.highestToLowest.cantidad=!this.highestToLowest.cantidad;
              break;
              case "version_insumo":
                if(this.highestToLowest.version_insumo){
                  this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                    if (a.supplie_inventory.version_insumo.nombre.toLowerCase() > b.supplie_inventory.version_insumo.nombre.toLowerCase()) return 1;
                    if (a.supplie_inventory.version_insumo.nombre.toLowerCase() < b.supplie_inventory.version_insumo.nombre.toLowerCase()) return -1;
                    return 0;
                  });
                }else{
                  this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                    if (b.supplie_inventory.version_insumo.nombre.toLowerCase() > a.supplie_inventory.version_insumo.nombre.toLowerCase()) return 1;
                    if (b.supplie_inventory.version_insumo.nombre.toLowerCase() < a.supplie_inventory.version_insumo.nombre.toLowerCase()) return -1;
                    return 0;
                  });
                }
                this.highestToLowest.version_insumo=!this.highestToLowest.version_insumo;
              break;
              case "cantidad_sap":
                if(this.highestToLowest.cantidad_sap){
                  this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                    if (a.cantidad_sap > b.cantidad_sap) return 1;
                    if (a.cantidad_sap < b.cantidad_sap) return -1;
                    return 0;
                  });
                }else{
                  this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                    if (b.cantidad_sap > a.cantidad_sap) return 1;
                    if (b.cantidad_sap < a.cantidad_sap) return -1;
                    return 0;
                  });
                }
                this.highestToLowest.cantidad_sap=!this.highestToLowest.cantidad_sap;
              break;
              case "difference_quantities":
                if(this.highestToLowest.difference_quantities){
                  this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                    if (a.difference_quantities > b.difference_quantities) return 1;
                    if (a.difference_quantities < b.difference_quantities) return -1;
                    return 0;
                  });
                }else{
                  this.suppliesInventoryComparative=this.suppliesInventoryComparative.sort((a, b) => {
                    if (b.difference_quantities > a.difference_quantities) return 1;
                    if (b.difference_quantities < a.difference_quantities) return -1;
                    return 0;
                  });
                }
                this.highestToLowest.difference_quantities=!this.highestToLowest.difference_quantities;
              break;
              default:
              break;
            }
          }
          

  
  ngOnDestroy() {
  }

}