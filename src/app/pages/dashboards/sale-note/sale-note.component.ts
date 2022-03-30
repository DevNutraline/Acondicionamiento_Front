import { Component, OnInit } from '@angular/core';
import { NotificationService } from "src/app/services/notification/notification.service";
import { SaleNoteService } from "src/app/services/sale-note/sale-note.service";
import { HistoryService } from "src/app/services/history/history.service";
import { ProductNV } from "src/app/models/productnv";
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from "moment";

@Component({
  selector: 'app-sale-note',
  templateUrl: './sale-note.component.html',
  styleUrls: ['./sale-note.component.scss']
})
export class SaleNoteComponent implements OnInit {
  public folderCode:string=null;
  public folder:any=null;
  public productsNV:ProductNV[]=[];
  public checkboxes: any[]=[];
  public productsSelected: any[]=[];
  public history:any[]=[];
  constructor(
    public historyService:HistoryService,
    public saleNoteService:SaleNoteService,
    public notificationService: NotificationService,
    public spinner: NgxSpinnerService,) { }

  ngOnInit() {
    this.getHistory();
  }
  /*obtiene listado de historial de envio de notas*/
  getHistory(){
    this.spinner.show();
    this.historyService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.notificationService.showSuccess('Operación realiza exitosamente',response.message)          
          this.history=response.data;
        }
      }).catch( error => {
        this.spinner.hide();
        console.log("error:",error)
        if(error.error){
              this.notificationService.showError('Error',error.error)
        }
      });
  }
  /*busqueda por condigo de carpeta*/
  searchFolderCode(){
    if(this.folderCode){
      this.spinner.show();
      this.saleNoteService.getByFolderCode({code:this.folderCode}).toPromise().then(
        response => {
          if(response!=undefined && response.data){
            this.spinner.hide();
            this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
            this.folder=response.data;
            this.productsNV=response.data.productosnv;
            this.checkboxes = this.productsNV.map(element=>{
              return {id:element.id,checked:false}
            });
          }
        }).catch( error => {
          this.spinner.hide();
          console.log("error:",error)
          if(error.error){
            if(error.error.error){
              if((error.error.error).indexOf("404 Not Found")){
                this.notificationService.showError('Error',{error:"Nota de venta no existente"})
              }else{
                this.notificationService.showError('Error',error.error)
              }
            }
          }
        });

    }else{
                this.notificationService.showError('Error',{error:"Debe ingresar el código de carpeta"})

      }
    
  }
  /*seleccion en checkbox*/
  toggleSelection(event, j) {
  	this.checkboxes[j].checked=!this.checkboxes[j].checked;
  	this.productsSelected=this.checkboxes.map(element=>{
  		return element.checked?{id:element.id,email:this.folder.email}:null;
  	})
  }
  sendNotes(){
  	this.productsSelected=this.productsSelected.filter(element=>{
  		if(element)
  			return element;
  	})
  	this.spinner.show();
  	this.saleNoteService.sendNotes({
      folder:this.folder,
  		productsSelected:this.productsSelected,
  	}).toPromise().then(
  	response => {
  		if(response!=undefined && response.data){
  			this.spinner.hide();
        if(response.data.new_history){
          this.history.push(response.data.new_history)
        }
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
  /*obtencion de formato de fecha*/ 
  formatDate(date:any){
    return moment.utc(date).format("YYYY-MM-DD HH:mm")
  }

}
