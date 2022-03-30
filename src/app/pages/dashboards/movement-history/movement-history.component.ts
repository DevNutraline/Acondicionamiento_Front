import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { SupplieInventoryService } from "src/app/services/supplie-inventory/supplie-inventory.service";
import { VersionInsumoService } from "src/app/services/version-insumo/version-insumo.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import * as moment from "moment";
//pdf
import jsPDF from 'jspdf'
import 'jspdf-autotable'
//xlsx
import * as XLSX from "xlsx"; 
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


@Component({
  selector: "app-movement-history",
  templateUrl: "movement-history.component.html",
  styleUrls: ['./movement-history.component.scss']
})
export class MovementHistoryComponent implements OnInit, OnDestroy {  
  public movementHistories:any[]=[];
  public movementHistoriesCopy:any[] = [];
  //filtrado
  public hoveredDate: NgbDate | null = null;
  public fromDate: NgbDate | null;
  public toDate: NgbDate | null;
  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string=null;
  //excel file
  public data: Array<any>=null;
  constructor(
    public supplieInventoryService: SupplieInventoryService,
    public notificationService: NotificationService,
    public calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    public spinner: NgxSpinnerService ) {
  }

  ngOnInit() {
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getToday();
    this.getMovementHistory();
  } 

  /*obtencion listado de historial de movimiento*/ 
  getMovementHistory(){
    this.spinner.show();
    this.supplieInventoryService.getMovementHistorie().toPromise().then(
      response => {
        this.spinner.hide();
        if(response!=undefined && response.data){
          this.movementHistories=response.data;
          this.movementHistoriesCopy=Array.from(this.movementHistories)
        }
      }).catch(error => {        
        this.spinner.hide();
        console.log("error:",error)
      });
    }
    /*cambio de datepicker*/
    onDateSelection(date: NgbDate) {
      if (!this.fromDate && !this.toDate) {
        this.fromDate = date;
      } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
        this.toDate = date;
      } else {
        this.toDate = null;
        this.fromDate = date;
      }
      if(this.fromDate && this.toDate){ 
        this.filterByDaterange();
      }      
    }
    isHovered(date: NgbDate) {
      return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
    }

    isInside(date: NgbDate) {
      return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
    }

    isRange(date: NgbDate) {
      return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
    }

    validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
      const parsed = this.formatter.parse(input);
      return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
    }
    filterByDaterange(){
      const fromDate=moment.utc(this.fromDate.year+"-"+this.fromDate.month+"-"+this.fromDate.day+" "+"00:00:00").format("YYYY-MM-DD HH:mm");
      const toDate=moment.utc(this.toDate.year+"-"+this.toDate.month+"-"+this.toDate.day+" "+"00:00:00").format("YYYY-MM-DD HH:mm");
      this.movementHistories=this.movementHistoriesCopy.filter(element=>{
        const createdAt=moment.utc(element.created_at).format("YYYY-MM-DD HH:mm");
        if (moment(createdAt).isAfter(fromDate)&&moment(toDate).isAfter(createdAt)) {
          return element;
        }
      
      }) 
    }
    
    /*obtencion de formato de fecha*/ 
    formatDate(date:any){
      return moment.utc(date).format("YYYY-MM-DD HH:mm")
    }
    /*abre pdf*/
    openPDF(url:string){
      window.open(encodeURI(url)); 
    }
    /*generacion de reporte en excel*/
    generateReport(){
      this.data=new Array();
      for(let movement of this.movementHistories){
        this.data.push({
          cod_interno: movement.insumo.cod_interno,
          descriptions: movement.insumo.descriptions,
          tamano: movement.insumo.tamano,
          email: movement.user.email,
          observations: movement.observations,
          movement: movement.movement,
          fecha_registro:this.formatDate(movement.created_at),
          cantidad:movement.cantidad,
        });
      }     
      this.exportAsExcelFile(this.data, 'listado-historial');
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
