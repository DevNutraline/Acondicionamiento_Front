import { Component, OnInit, OnDestroy } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import {  ActivatedRoute,  Router } from '@angular/router';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";
import { Product } from "src/app/models/product";
import { VersionProduct } from "src/app/models/version-product";
import { VersionProductService } from "src/app/services/version-product/version-product.service";
import { NotificationService } from "src/app/services/notification/notification.service";
import { ProductService } from "src/app/services/product/product.service";
import { productConfigObj } from "./selectsconfigs/configs";
import * as moment from "moment";

@Component({
  selector: "app-product-version-form",
  templateUrl: "product-version-form.component.html",
  styleUrls: ["./product-version-form.component.scss"]
})
export class ProductVersionFormComponent implements OnInit, OnDestroy {  
  public productConfig:any = productConfigObj;
  public products:Product[]=[];
  public productSelected:Product=null;
  public versionProduct:VersionProduct=null;
  public formData = new FormData();
  //images
  public fileData: File = null;
  public fileDataValidator: boolean = false;
  public previewUrlMainFace:any=null;
  public previewUrlNutritionalInformation1:any=null;
  public previewUrlNutritionalInformation2:any=null;
  public previewUrlClaimsYMarketing1:any=null;
  public previewUrlClaimsYMarketing2:any=null;
  public previewUrlProductVersion:any=null;
  public previewUrlEAN13:any=null;
  public previewUrlAditional1:any=null;
  public previewUrlAditional2:any=null;
  public previewUrlAditional3:any=null;
  public selectDisabled:boolean=false;
  constructor(
    public productService: ProductService,
    public versionProductService: VersionProductService,
    public notificationService: NotificationService,
    public spinner: NgxSpinnerService,
    public router: Router,
    public route:ActivatedRoute  ) {
  }

  ngOnInit() {
    this.setDefaultValues();
    this.getProducts();
  } 
  /* obtencion de listado de productos */ 
  getProducts(){
    this.spinner.show();
    this.productService.getAll().toPromise().then(
      response => {
        if(response!=undefined && response.data){
          this.spinner.hide();
          this.products=response.data;
          this.verifyEditElement();
        }
      }
      ).catch( 
      error => {
        this.spinner.hide();
        console.log("error:",error)
      }
      );
    }

    /* detector de cambio cambio en select */ 
    selectionChanged(event:any,element:string){
      switch (element) {
        case "product":
          this.versionProduct.id_product=event.value?event.value.id:null;
          break;
        default:
        // code...
        break;
      }
    }
    fileProgress(fileInput: any,image:string) {
          this.fileData = <File>fileInput.target.files[0];
          this.fileDataValidator = false;
          this.preview(image);
        }

        preview(image:string) {
          if (
            this.fileData.type.match("image/jpg") ||
            this.fileData.type.match("image/gif") ||
            this.fileData.type.match("image/png") ||
            this.fileData.type.match("image/jpeg") ||
            this.fileData.type.match("image/bmp")
            ) {
          var reader = new FileReader();
          reader.readAsDataURL(this.fileData);
          reader.onload = _event => {

            switch (image) {
              case "main_face":
                this.versionProduct.imagenMainFace=this.fileData;
                this.previewUrlMainFace = reader.result;
                break;
              case "nutritional_information1":
                this.versionProduct.imagenNutritionalInformation1=this.fileData;
                this.previewUrlNutritionalInformation1 = reader.result;
                break;
              case "nutritional_information2":
                this.versionProduct.imagenNutritionalInformation2=this.fileData;
                this.previewUrlNutritionalInformation2 = reader.result;
                break;
              case "claims_marketing1":
                this.versionProduct.imagenClaimsYMarketing1=this.fileData;
                this.previewUrlClaimsYMarketing1 = reader.result;
                break;
              case "claims_marketing2":
                this.versionProduct.imagenClaimsYMarketing2=this.fileData;
                this.previewUrlClaimsYMarketing2 = reader.result;
                break;
              case "product_version":
                this.versionProduct.imagenProductVersion=this.fileData;
                this.previewUrlProductVersion = reader.result;
                break;
              case "ean13":
                this.versionProduct.imagenEAN13=this.fileData;
                this.previewUrlEAN13 = reader.result;
                break;
              case "aditional1":
                this.versionProduct.imagenAditional1=this.fileData;
                this.previewUrlAditional1 = reader.result;
                break;
              case "aditional2":
                this.versionProduct.imagenAditional2=this.fileData;
                this.previewUrlAditional2 = reader.result;
                break;
              case "aditional3":
                this.versionProduct.imagenAditional3=this.fileData;
                this.previewUrlAditional3 = reader.result;
                break;
              default:
                // code...
                break;
            }
          };
        }
      }

    /* obtencion de datos de formulario */ 
    getFormData() {
      if(this.versionProduct.name)
        this.formData.append("name", `${this.versionProduct.name}`); 
      this.formData.append("id_product", `${this.versionProduct.id_product}`);
      this.formData.append("imagenMainFace", this.versionProduct.imagenMainFace);
      this.formData.append("imagenNutritionalInformation1", this.versionProduct.imagenNutritionalInformation1);
      this.formData.append("imagenNutritionalInformation2", this.versionProduct.imagenNutritionalInformation2);
      this.formData.append("imagenClaimsYMarketing1", this.versionProduct.imagenClaimsYMarketing1);
      this.formData.append("imagenClaimsYMarketing2", this.versionProduct.imagenClaimsYMarketing2);
      this.formData.append("imagenProductVersion", this.versionProduct.imagenProductVersion);
      this.formData.append("imagenEAN13", this.versionProduct.imagenEAN13);
      this.formData.append("imagenAditional1", this.versionProduct.imagenAditional1);
      this.formData.append("imagenAditional2", this.versionProduct.imagenAditional2);
      this.formData.append("imagenAditional3", this.versionProduct.imagenAditional3);
      const productReceptionId=this.route.snapshot.paramMap.get('productreceptionid');
      if(productReceptionId){
        this.formData.append("productreceptionid", productReceptionId);
      }
      return this.formData;
    }
    /* registra o actualiza elemento */ 
    register(){
      if(this.versionProduct.id){
        this.spinner.show();
        this.versionProductService.updateElement(this.versionProduct.id,this.getFormData()).toPromise().then(
          response => {
            if(response!=undefined && response.data){              
              this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
              this.router.navigate(["dashboards/product-versions"]);
              this.spinner.hide();
              if(this.route.snapshot.paramMap.get('element')=='products'){
                this.router.navigate(["dashboards/products"]);
              }
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
          this.versionProductService.create(this.getFormData()).toPromise().then(
            response => {
              if(response!=undefined && response.data){
                this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                
                const folderCode=this.route.snapshot.paramMap.get('foldercode');
                const facturaId=this.route.snapshot.paramMap.get('facturaid');
                const productReceptionId=this.route.snapshot.paramMap.get('productreceptionid');

                if(folderCode && facturaId && productReceptionId){
                  this.router.navigate(["dashboards/product-reception",folderCode,facturaId]);
                }else{
                  this.router.navigate(["dashboards/product-versions"]);
                }
                this.spinner.hide();
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
        /* carga de valores por defecto */ 
        setDefaultValues(){
          this.versionProduct=new VersionProduct();
          this.productSelected=null;
          this.previewUrlMainFace=null;
          this.previewUrlNutritionalInformation1=null;
          this.previewUrlNutritionalInformation2=null;
          this.previewUrlClaimsYMarketing1=null;
          this.previewUrlClaimsYMarketing2=null;
          this.previewUrlProductVersion=null;
          this.previewUrlEAN13=null;
          this.previewUrlAditional1=null;
          this.previewUrlAditional2=null;
          this.previewUrlAditional3=null;
        }
        /*verifica si el elemento se va a editar por medio de parametros*/
        verifyEditElement(){
          if(this.route.snapshot.paramMap.get('id')){
            switch (this.route.snapshot.paramMap.get('element')) {
              case "version":
                this.selectDisabled=false;
                this.getVersionProduct();
                break;
              case "product":
                this.selectDisabled=true;
                this.getProduct();
                // code...
                break;
              case "products":
                this.selectDisabled=true;
                this.getVersionProduct();
                // code...
                break;
              default:
                // code...
                break;
            }            
          }
        }
        /*obtencion de producto*/
        getProduct(){

                this.productSelected=this.products.find(element=>{
                  return element.id==parseInt(this.route.snapshot.paramMap.get('id'));
                });
                this.versionProduct.id_product=this.productSelected.id
        }
          /* obtencion de version de producto */ 
          getVersionProduct(){
            this.spinner.show();
            this.versionProductService.get(this.route.snapshot.paramMap.get('id')).toPromise().then(
              response => {
                if(response!=undefined && response.data){                  
                  this.notificationService.showSuccess('Operación realiza exitosamente',response.message)
                  this.spinner.hide();
                  this.versionProduct=response.data;
                  this.productSelected=this.products.find(element=>{
                    return element.id==this.versionProduct.id_product;
                  });
                  this.previewUrlMainFace=this.versionProduct.imagenMainFace;
                  this.previewUrlNutritionalInformation1=this.versionProduct.imagenNutritionalInformation1;
                  this.previewUrlNutritionalInformation2=this.versionProduct.imagenNutritionalInformation2;
                  this.previewUrlClaimsYMarketing1=this.versionProduct.imagenClaimsYMarketing1;
                  this.previewUrlClaimsYMarketing2=this.versionProduct.imagenClaimsYMarketing2;
                  this.previewUrlProductVersion=this.versionProduct.imagenProductVersion;
                  this.previewUrlEAN13=this.versionProduct.imagenEAN13;
                  this.previewUrlAditional1=this.versionProduct.imagenAditional1;
                  this.previewUrlAditional2=this.versionProduct.imagenAditional2;
                  this.previewUrlAditional3=this.versionProduct.imagenAditional3;
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
        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        ngOnDestroy() {
        }

  }
