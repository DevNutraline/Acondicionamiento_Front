import { Component, OnInit, OnDestroy } from "@angular/core";
import { User } from "src/app/models/user";
import { FolderService } from "src/app/services/folder/folder.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import Chart from "chart.js";
import * as moment from "moment";
import { extendMoment } from "moment-range";

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2,
  chartExample3
} from "../../../variables/charts";
@Component({
  selector: "app-alternative",
  templateUrl: "alternative.component.html",
  styleUrls: ['./alternative.component.scss']
})
export class AlternativeComponent implements OnInit, OnDestroy {
  public datasets: any;
  public data: any;
  public salesChart;
  public clicked: boolean = true;
  public clicked1: boolean = false;

  public folderStatues:any={
    inReceptionProcess:[],
    inOVAProcess:[],
    pendingCommercialClosure:[],
    releasedForSale:[]
  }

  public user:User=null;

  /*grafica de cantidad de usuarios*/
  public releasedForSale:any = {
    options: {
      scales: {
        yAxes: [
          {
            gridLines: {
              color: '#0089ee',//colors.gray[900],
              zeroLineColor: '#0089ee',//colors.gray[900]
            },
            ticks: {
              callback: function(value) {
                if (!(value % 10)) {
                  return value;
                }
              }
            }
          }
        ]
      }
    },
    data: {
      labels: [],
      datasets: [
        {
          label: "Liberada a la venta",
          data: [],
          borderColor: '#0089ee'
        }
      ]
    }
  };
  /*grafica de carpetas pendientes de cierre comercial*/
  public pendingCommercialClosure:any = {
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              callback: function(value) {
                if (!(value % 10)) {
                  //return '$' + value + 'k'
                  return value;
                }
              }
            }
          }
        ]
      },
      tooltips: {
        callbacks: {
          label: function(item, data) {
            var label = data.datasets[item.datasetIndex].label || "";
            var yLabel = item.yLabel;
            var content = "";
            if (data.datasets.length > 1) {
              content += label;
            }
            content += yLabel;
            return content;
          }
        }
      }
    },
    data: {
      labels: [],
      datasets: [
        {
          label: "Carpetas pendientes de cierre comercial",
          data: [],
          backgroundColor: '#f24947'
        }
      ]
    }
  };
  /*grafica de cantidad de carpetas en proceso de recepcion*/
  public inReceptionProcess:any = {
    options: {
      scales: {
        yAxes: [
          {
            gridLines: {
              color: '#9d93ea',//colors.gray[900],
              zeroLineColor: '#9d93ea',//colors.gray[900]
            },
            ticks: {
              callback: function(value) {
                if (!(value % 10)) {
                  return value;
                }
              }
            }
          }
        ]
      }
    },
    data: {
      labels: [],
      datasets: [
        {
          label: "Carpetas en proceso de recepción",
          data: [],
          borderColor: '#9d93ea'
        }
      ]
    }
  };
  /*grafica de cantidad de carpetas en proceso ova*/
  public inOVAProcess:any = {
      options: {
        scales: {
          yAxes: [
            {
              gridLines: {
                color: 'red',
                zeroLineColor: 'red',
              },
              ticks: {
                callback: function(value) {
                  if (!(value % 10)) {
                    return value;
                  }
                }
              }
            }
          ]
        }
      },
      data: {
        labels: [],
        datasets: [
          {
            label: "Carpetas en proceso OVA",
            data: [],
            backgroundColor: '#1a1b4c'
          }
        ]
      }
  };

  constructor(
    public folderService: FolderService,
    public notificationService: NotificationService,
    public spinner: NgxSpinnerService,
    public router: Router,) {}

  ngOnInit() {
    this.getUser();
    this.datasets = [
      [0, 20, 10, 30, 15, 40, 20, 60, 60],
      [0, 20, 5, 25, 10, 30, 15, 40, 40]
    ];
    this.data = this.datasets[0];
    parseOptions(Chart, chartOptions());
    this.getFolderStatues();
  }
  /*obtencion de estados de carpetas*/
  getFolderStatues(){
    this.spinner.show();
    this.folderService.getFolderCommercialStatues().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.folderStatues.inReceptionProcess=response.data.in_reception_process;
          this.folderStatues.inOVAProcess=response.data.in_OVA_process;
          this.folderStatues.pendingCommercialClosure=response.data.pending_commercial_closure;
          this.folderStatues.releasedForSale=response.data.released_for_sale;
          this.buildInReceptionProcessChart();
          this.buildInOVAProcess();
          this.buildReleasedForSaleChart();
          this.buildPendingCommercialClosureChart();
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
  /*construir grafica de carpetas en proceso de recepcion*/
  buildInOVAProcess(){
    const chartFolderInOvaProcess = document.getElementById("chart-folder-inovaprocess");
    if(this.folderStatues.inOVAProcess.length>0){
      const fromDate = moment.utc(this.folderStatues.inOVAProcess[0].created_at)
      const toDate = moment.utc(this.folderStatues.inOVAProcess[this.folderStatues.inOVAProcess.length-1].created_at);
      const rangeMoment = extendMoment(moment);
      const range = rangeMoment.range(fromDate, toDate);
      const days = Array.from(range.by('day'));
      days.map(m => m.format('DD MM YYYY'))
      for(const day of days){
        this.inOVAProcess.data.labels.push(day.format("YYYY-MM-DD"))
        let productsByDate=this.folderStatues.inOVAProcess.filter(element=>{
          if(moment.utc(element.created_at).format("YYYY-MM-DD")===day.format("YYYY-MM-DD")){
            return element;
          }
        })
        this.inOVAProcess.data.datasets[0].data.push(productsByDate.length)
      }
    }
    var inOVAProcess = new Chart(chartFolderInOvaProcess, {
      type: "line",
      options: this.inOVAProcess.options,
      data: this.inOVAProcess.data
    });
  }

    /*construir grafica de carpetas en proceso de recepcion*/
  buildInReceptionProcessChart(){
    const chartFolderInReceptionProcess = document.getElementById("chart-folder-inreceptionprocess");
    if(this.folderStatues.inReceptionProcess.length>0){
      const fromDate = moment.utc(this.folderStatues.inReceptionProcess[0].created_at)
      const toDate = moment.utc(this.folderStatues.inReceptionProcess[this.folderStatues.inReceptionProcess.length-1].created_at);
      const rangeMoment = extendMoment(moment);
      const range = rangeMoment.range(fromDate, toDate);
      const days = Array.from(range.by('day'));
      days.map(m => m.format('DD MM YYYY'))
      for(const day of days){
        this.inReceptionProcess.data.labels.push(day.format("YYYY-MM-DD"))
        let productsByDate=this.folderStatues.inReceptionProcess.filter(element=>{
          if(moment.utc(element.created_at).format("YYYY-MM-DD")===day.format("YYYY-MM-DD")){
            return element;
          }
        })
        this.inReceptionProcess.data.datasets[0].data.push(productsByDate.length)
      }
    }
    var inReceptionProcess = new Chart(chartFolderInReceptionProcess, {
      type: "line",
      options: this.inReceptionProcess.options,
      data: this.inReceptionProcess.data
    });
  }
  /*construir grafica de carpetas liberadas a la venta*/
  buildReleasedForSaleChart(){
    var chartFolderReleasedforsale = document.getElementById("chart-folder-releasedforsale");
    if(this.folderStatues.releasedForSale.length>0){
      const fromDate = moment.utc(this.folderStatues.releasedForSale[0].created_at)
      const toDate = moment.utc(this.folderStatues.releasedForSale[this.folderStatues.releasedForSale.length-1].created_at)
      const rangeMoment = extendMoment(moment);
      const range = rangeMoment.range(fromDate, toDate);
      const days = Array.from(range.by('day'));
      days.map(m => m.format('DD MM YYYY'))
      for(const day of days){
        this.releasedForSale.data.labels.push(day.format("YYYY-MM-DD"))
        let recipientsByDate=this.folderStatues.releasedForSale.filter(element=>{
          if(moment.utc(element.created_at).format("YYYY-MM-DD")===day.format("YYYY-MM-DD")){
            return element;
          }
        })
        this.releasedForSale.data.datasets[0].data.push(recipientsByDate.length)
      }
    }
    var ordersChart = new Chart(chartFolderReleasedforsale, {
      type: "bar",
      options: this.releasedForSale.options,
      data: this.releasedForSale.data
    });
  }
  /*construir grafica de insumos*/
  buildPendingCommercialClosureChart(){
    var chartFolderPendingCommercialClosure = document.getElementById("chart-folder-pendingcommercialclosure");
    if(this.folderStatues.pendingCommercialClosure.length>0){
      const fromDate = moment.utc(this.folderStatues.pendingCommercialClosure[0].created_at)
      const toDate = moment.utc(this.folderStatues.pendingCommercialClosure[this.folderStatues.pendingCommercialClosure.length-1].created_at);
      const rangeMoment = extendMoment(moment);
      const range = rangeMoment.range(fromDate, toDate);
      const days = Array.from(range.by('day'));
      days.map(m => m.format('DD MM YYYY'))
      for(const day of days){
        this.pendingCommercialClosure.data.labels.push(day.format("YYYY-MM-DD"))
        let suppliesByDate=this.folderStatues.pendingCommercialClosure.filter(element=>{
          if(moment.utc(element.created_at).format("YYYY-MM-DD")===day.format("YYYY-MM-DD")){
            return element;
          }
        })
        this.pendingCommercialClosure.data.datasets[0].data.push(suppliesByDate.length)
      }
    }
    var ordersChart = new Chart(chartFolderPendingCommercialClosure, {
      type: "bar",
      options: this.pendingCommercialClosure.options,
      data: this.pendingCommercialClosure.data
    });
  }

  /*obtiene usuario en sesión desde localStorage*/
  getUser(){    
    this.user=JSON.parse(localStorage.getItem("user")).user;
  }  
    
    /*navegacion por ruta*/ 
    navigateTo(route:any[]){
      const permissions=this.user.rol.role_permissions;
      let permission=null;
      switch (route[0]) {
        case "dashboards/users":
          permission=permissions.find(element=>{
            if(element.permission.name=="Seguridad"){
              return element;
            }
          });
          if(permission){
            this.router.navigate(route);
          }
          break;
        case "dashboards/supplies":
          permission=permissions.find(element=>{
            if(element.permission.name=="Insumos"){
              return element;
            }
          });
          if(permission){
            this.router.navigate(route);
          }          break;
        case "dashboards/products":
          permission=permissions.find(element=>{
            if(element.permission.name=="Acondicionamiento"){
              return element;
            }
          });
          if(permission){
            this.router.navigate(route);
          }
          break;
        case "dashboards/recipients":
          permission=permissions.find(element=>{
            if(element.permission.name=="Notificaciones"){
              return element;
            }
          });
          if(permission){
            this.router.navigate(route);
          }
          break;
        default:
          // code...
          break;
      }
      //
    }
  ngOnDestroy() {
    var navbar = document.getElementsByClassName("navbar-top")[0];
    navbar.classList.remove("bg-secondary");
    navbar.classList.remove("navbar-light");
    navbar.classList.add("bg-danger");
    navbar.classList.add("navbar-dark");

    var navbarSearch = document.getElementsByClassName("navbar-search")[0];
    navbarSearch.classList.remove("navbar-search-dark");
    navbarSearch.classList.add("navbar-search-light");
  }
}
