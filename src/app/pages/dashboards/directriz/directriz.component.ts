import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { Directriz } from 'src/app/models/directriz';
import { Supplie } from 'src/app/models/supplie';
import { Product } from 'src/app/models/product';
import { SupplieVersion } from 'src/app/models/supplie-version';
import { VersionProduct } from 'src/app/models/version-product';
import { PurchaseNote } from 'src/app/models/purchase-note';
import { VersionProductService } from 'src/app/services/version-product/version-product.service';
import { DirectrizService } from 'src/app/services/directriz/directriz.service';
import { SupplieService } from 'src/app/services/supplie/supplie.service';
import { SupplieVersionService } from 'src/app/services/supplie-version/supplie-version.service';
import { GroupService } from 'src/app/services/group/group.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { supplieConfigObj, versionInsumoConfigObj, groupConfigObj, genericConfigObj } from './selectsconfigs/configs';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation, NgxGalleryAction } from '@kolkov/ngx-gallery';
import Swal from 'sweetalert2';
//pdf
import jsPDF from 'jspdf'
import 'jspdf-autotable'
//moment
import * as moment from 'moment';

@Component({
  selector: 'app-directriz',
  templateUrl: './directriz.component.html',
  styleUrls: ['./directriz.component.scss']
})
export class DirectrizComponent implements OnInit, OnDestroy {
  public directrizs: Directriz[] = [];
  public directriz: Directriz = null;
  public product: Product = new Product();
  public versionProduct: VersionProduct = new VersionProduct();
  public modalRef: any = null;

  public supplieConfig: any = supplieConfigObj;
  public supplies: Supplie[] = [];
  public suppliesCopy: Supplie[] = [];
  public supplieSelected: Supplie = null;

  public groupConfig: any = groupConfigObj;
  public groups: any[] = [];
  public groupSelected: number = null;

  public genericConfig: any = genericConfigObj;
  public generics: any[] = [{ name: 'Genérico' }, { name: 'Específico' }];
  public genericSelected: any = null;

  public versionInsumoConfig: any = versionInsumoConfigObj;
  public suppliesVersions: SupplieVersion[] = [];
  public suppliesVersionsSelected: SupplieVersion[] = [];
  public supplieVersionSelected: SupplieVersion = null;
  public disabledVersionSelect: boolean = false;

  //galeria
  /*public imageGallerySelected:any={index:null,src:null};*/
  public imageName: string = null;

  //paginacion
  public p: number = 1;
  //buscador 
  public searchTable: string = null;

  public formData = new FormData();

  public fileData: File = null;
  public previewUrl: any = null;

  public purchaseNote: PurchaseNote = new PurchaseNote();
  public purchasesNotes: PurchaseNote[] = [];
  public previewOriginalUrl: any = null;
  public previewLabeledUrl: any = null;
  //sort 
  public highestToLowest: any = {
    detalle: false,
    image: false,
    insumo: false,
    insumo_version: false,
    version_product: false,
  };
  //pdf
  //public pdf: any = new jsPDF();

  public images: any[] = [];

  public galleryPhotos: NgxGalleryImage[] = [];
  public galleryOptions: NgxGalleryOptions[] = [{
    width: '100%',
    height: '400px',
    thumbnailsColumns: 4,
    imageAnimation: NgxGalleryAnimation.Slide,
    imageActions: []
  },
  // max-width 800
  {
    breakpoint: 800,
    width: '100%',
    height: '600px',
    imagePercent: 80,
    thumbnailsPercent: 20,
    thumbnailsMargin: 20,
    thumbnailMargin: 20
  },
  // max-width 400
  {
    breakpoint: 400,
    preview: false
  }];
  constructor(
    public route: ActivatedRoute,
    public supplieService: SupplieService,
    public supplieVersionService: SupplieVersionService,
    public groupService: GroupService,
    public versionProductService: VersionProductService,
    public directrizService: DirectrizService,
    public notificationService: NotificationService,
    public modalService: NgbModal,
    public spinner: NgxSpinnerService,
    public sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.setDefaultValues();
    this.getVersionProduct();
    this.getDirectrizsByVersionProduct();
    this.getSupplies();
    this.getGroups();
  }
  /*obtencion de grupos*/
  getGroups() {
    this.spinner.show();
    this.groupService.getAll().toPromise().then(
      response => {
        if (response != undefined && response.data) {
          this.spinner.hide();
          this.groups = response.data;
        }
      }
    ).catch(
      error => {
        this.spinner.hide();
        console.log('error:', error)
      }
    );
  }
  /* obtencion de listado de insumos */
  getSupplies() {
    this.spinner.show();
    this.supplieService.getAll().toPromise().then(
      response => {
        if (response != undefined && response.data) {
          this.spinner.hide();
          this.supplies = response.data;
          this.suppliesCopy = response.data;
        }
      }
    ).catch(
      error => {
        this.spinner.hide();
        console.log('error:', error)
      }
    );
  }
  /* obtencion de version de producto */
  getVersionProduct() {
    this.spinner.show();
    this.versionProductService.get(this.route.snapshot.paramMap.get('id')).toPromise().then(response => {
      if (response != undefined && response.data) {
        this.spinner.hide();
        this.versionProduct = response.data;
        this.product = <Product>this.versionProduct.product;
        this.images.push({
          src: this.versionProduct.imagenMainFace,
          title: 'Cara principal'
        })
        this.galleryPhotos.push({
          small: this.versionProduct.imagenMainFace,
          medium: this.versionProduct.imagenMainFace,
          big: this.versionProduct.imagenMainFace
        })
        this.images.push({
          src: this.versionProduct.imagenNutritionalInformation1,
          title: 'Información Nutricional 1'
        })
        this.galleryPhotos.push({
          small: this.versionProduct.imagenNutritionalInformation1,
          medium: this.versionProduct.imagenNutritionalInformation1,
          big: this.versionProduct.imagenNutritionalInformation1
        })
        this.images.push({
          src: this.versionProduct.imagenNutritionalInformation2,
          title: 'Información Nutricional 2'
        })
        this.galleryPhotos.push({
          small: this.versionProduct.imagenNutritionalInformation2,
          medium: this.versionProduct.imagenNutritionalInformation2,
          big: this.versionProduct.imagenNutritionalInformation2
        })
        this.images.push({
          src: this.versionProduct.imagenClaimsYMarketing1,
          title: 'Claims y Marketing 1'
        })
        this.galleryPhotos.push({
          small: this.versionProduct.imagenClaimsYMarketing1,
          medium: this.versionProduct.imagenClaimsYMarketing1,
          big: this.versionProduct.imagenClaimsYMarketing1
        })
        this.images.push({
          src: this.versionProduct.imagenClaimsYMarketing2,
          title: 'Claims y Marketing 2'
        })
        this.galleryPhotos.push({
          small: this.versionProduct.imagenClaimsYMarketing2,
          medium: this.versionProduct.imagenClaimsYMarketing2,
          big: this.versionProduct.imagenClaimsYMarketing2
        })
        this.images.push({
          src: this.versionProduct.imagenProductVersion,
          title: 'Versión del producto'
        })
        this.galleryPhotos.push({
          small: this.versionProduct.imagenProductVersion,
          medium: this.versionProduct.imagenProductVersion,
          big: this.versionProduct.imagenProductVersion
        })
        this.images.push({
          src: this.versionProduct.imagenEAN13,
          title: 'EAN13'
        })
        this.galleryPhotos.push({
          small: this.versionProduct.imagenEAN13,
          medium: this.versionProduct.imagenEAN13,
          big: this.versionProduct.imagenEAN13
        })
        this.images.push({
          src: this.versionProduct.imagenAditional1,
          title: 'Adicional 1'
        })
        this.galleryPhotos.push({
          small: this.versionProduct.imagenAditional1,
          medium: this.versionProduct.imagenAditional1,
          big: this.versionProduct.imagenAditional1
        })
        this.images.push({
          src: this.versionProduct.imagenAditional2,
          title: 'Adicional 2'
        })
        this.galleryPhotos.push({
          small: this.versionProduct.imagenAditional2,
          medium: this.versionProduct.imagenAditional2,
          big: this.versionProduct.imagenAditional2
        })
        this.images.push({
          src: this.versionProduct.imagenAditional3,
          title: 'Adicional 3'
        })
        this.galleryPhotos.push({
          small: this.versionProduct.imagenAditional3,
          medium: this.versionProduct.imagenAditional3,
          big: this.versionProduct.imagenAditional3
        })
        this.getPurchasesNotes();
      }
    }).catch(error => {
      this.spinner.hide();
      console.log('error:', error)
    });
  }
  getPurchasesNotes() {
    this.spinner.show();
    this.directrizService.getPurchasesNotes(this.versionProduct.id).toPromise().then(
      response => {
        if (response != undefined && response.data) {
          this.spinner.hide();
          this.purchasesNotes.push(response.data);
        }
      }
    ).catch(
      error => {
        this.spinner.hide();
        console.log('error:', error)
        if (error.error)
          this.notificationService.showError('Error', error.error)
      }
    );
  }
  /* obtencion de listado de directrices por version de producto */
  getDirectrizsByVersionProduct() {
    this.spinner.show();
    this.directrizService.getByVersionProduct(this.route.snapshot.paramMap.get('id')).toPromise().then(
      response => {
        if (response != undefined && response.data) {
          this.spinner.hide();
          this.directrizs = response.data;
        }
      }).catch(
        error => {
          this.spinner.hide();
          if (error.error)
            this.notificationService.showError('Error', error.error)
        });
  }
  /*abre modal*/
  open(content: any) {
    this.setDefaultValues();
    this.modalRef = this.modalService.open(content, { size: 'lg' });
  }

  /* carga de valores por defecto */
  setDefaultValues() {
    this.directriz = new Directriz();
    this.formData = new FormData();
    this.supplieSelected = null;
    this.suppliesVersionsSelected = [];
    this.supplieVersionSelected = null;
    this.previewUrl = null;

    this.purchaseNote = new PurchaseNote();
    this.previewOriginalUrl = null;
    this.previewLabeledUrl = null;

    this.groupSelected = null;
    this.previewUrl = null;
    this.fileData = null;

    this.genericSelected = null;
  }

  /* obtencion de datos de formulario */
  getPurchaseNoteFormData() {
    this.formData.append('note', `${this.purchaseNote.note}`);
    if (this.purchaseNote.original)
      this.formData.append('original', this.purchaseNote.original);
    if (this.purchaseNote.labeled)
      this.formData.append('labeled', this.purchaseNote.labeled);
    this.formData.append('id_version_product', `${this.route.snapshot.paramMap.get('id')}`);
    this.formData.append('id_product', `${this.product.id}`);
    return this.formData;
  }
  registerPurchaseNote() {
    if (this.purchaseNote.id) {
      this.spinner.show();
      this.directrizService.updatePurchaseNote(this.purchaseNote.id, this.getPurchaseNoteFormData()).toPromise().then(response => {
        if (response != undefined && response.data) {
          this.purchasesNotes = this.purchasesNotes.map(element => {
            return element.id == response.data.id ? response.data : element;
          })
          this.spinner.hide();
          this.notificationService.showSuccess('Operación realiza exitosamente', response.message)
          this.modalRef.close();
          this.setDefaultValues();
        }
      }).catch(error => {
        this.spinner.hide();
        this.notificationService.showError('Error', error.error)
      });
    }
    else {
      this.spinner.show();
      this.directrizService.registerPurchaseNote(this.getPurchaseNoteFormData()).toPromise().then(
        response => {
          if (response != undefined && response.data) {
            this.spinner.hide();
            this.purchasesNotes.push(response.data);
            this.notificationService.showSuccess('Operación realiza exitosamente', response.message)
            this.modalRef.close();
            this.setDefaultValues();
          }
        }).catch(
          error => {
            this.spinner.hide();
            if (error.error)
              this.notificationService.showError('Error', error.error)
            console.log('error:', error)
          }
        );
    }
  }
  deletePurchaseNote(id: number) {
    this.spinner.show();
    this.directrizService.deletePurchaseNote(id).toPromise().then(
      response => {
        if (response != undefined && response.data) {
          this.spinner.hide();
          this.purchasesNotes = this.purchasesNotes.filter(element => {
            if (element.id != response.data.id) {
              return element;
            }
          });
          this.setDefaultValues();
        }
      }).catch(
        error => {
          this.spinner.hide();
          if (error.error)
            this.notificationService.showError('Error', error.error)
          console.log('error:', error)
        }
      );
  }
  editPurchaseNote(purchaseNote: PurchaseNote, content: any) {
    this.purchaseNote = Object.assign({}, purchaseNote);
    this.modalRef = this.modalService.open(content, { size: 'lg' });
    this.previewOriginalUrl = this.purchaseNote.original;
    this.previewLabeledUrl = this.purchaseNote.labeled;
  }
  /* obtencion de datos de formulario */
  getFormData(element: string) {
    switch (element) {
      case 'directriz':
        if (this.genericSelected)
          this.formData.append('generico_especifico', `${this.genericSelected}`);
        if (this.directriz.detalle)
          this.formData.append('detalle', `${this.directriz.detalle}`);
        if (this.directriz.id_insumo)
          this.formData.append('id_insumo', `${this.directriz.id_insumo}`);
        if (this.directriz.id_version_insumo)
          this.formData.append('id_version_insumo', `${this.directriz.id_version_insumo}`);
        this.formData.append('id_version_product', `${this.route.snapshot.paramMap.get('id')}`);
        if (this.directriz.image) {
          this.formData.append('image', this.directriz.image);
        }
        break;
      case 'supplie':
        this.formData.append('id_grupo', `${this.supplieSelected.id_grupo}`);
        this.formData.append('cod_interno', `${this.supplieSelected.cod_interno}`);
        if (this.supplieSelected.cod_sap)
          this.formData.append('cod_sap', `${this.supplieSelected.cod_sap}`);
        this.formData.append('descriptions', `${this.supplieSelected.descriptions}`);
        this.formData.append('en_transito', `${this.supplieSelected.en_transito}`);
        this.formData.append('tamano', `${this.supplieSelected.tamano}`);
        this.formData.append('inventariado', `${this.supplieSelected.inventariado}`);
        this.formData.append('informar', `${this.supplieSelected.informar}`);
        this.formData.append('comprar', `${this.supplieSelected.comprar}`);
        this.formData.append('imagen', this.supplieSelected.imagen);
        break;
      case 'supplie-version':
        this.formData.append('nombre', `${this.supplieVersionSelected.nombre}`);
        this.formData.append('id_insumo', `${this.supplieVersionSelected.id_insumo}`);
        this.formData.append('imagen', this.supplieVersionSelected.imagen);
        break;
      default:
        // code...
        break;
    }

    return this.formData;
  }
  /* registra o actualiza elemento */
  register() {
    if (this.directriz.id) {
      this.spinner.show();
      this.directrizService.updateElement(this.directriz.id, this.getFormData('directriz')).toPromise().then(response => {
        if (response != undefined && response.data) {
          this.spinner.hide();
          this.directrizs = this.directrizs.map(element => {
            return element.id == response.data.id ? response.data : element;
          })
          this.notificationService.showSuccess('Operación realiza exitosamente', response.message)
          this.modalRef.close();
          this.setDefaultValues();
        }
      }).catch(
        error => {
          this.spinner.hide();
          this.notificationService.showError('Error', error.error)
        }
      );
    } else {
      this.spinner.show();
      this.directrizService.create(this.getFormData('directriz')).toPromise().then(response => {
        if (response != undefined && response.data) {
          this.spinner.hide();
          this.directrizs.push(response.data)
          this.notificationService.showSuccess('Operación realiza exitosamente', response.message)
          this.modalRef.close();
          this.setDefaultValues();
        }
      }).catch(error => {
        this.spinner.hide();
        this.notificationService.showError('Error', error.error)
        console.log('error:', error)
      });
    }
  }
  /* eliminacion de elemento por id */
  delete(id: number) {
    this.directriz = this.directrizs.find(element => {
      return element.id == id ? element : null
    })
    Swal.fire({
      title: 'Confirmar operación',
      text: '¿Desea eliminar la directriz "' + this.directriz.detalle + '" ?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, Cancelar'
    }).then((result) => {
      if (result.value) {
        this.spinner.show();
        this.directrizService.deleteElement(id).toPromise().then(
          response => {
            if (response != undefined && response.data) {
              this.spinner.hide();
              this.directrizs = this.directrizs.filter(element => {
                if (element.id != response.data.id) {
                  return element
                }
              })
              this.notificationService.showSuccess('Operación realiza exitosamente', response.message)
            }
          }
        ).catch(
          error => {
            this.spinner.hide();
            this.notificationService.showError('Error', error.error)
            console.log('error:', error)
          }
        );
      }
      this.setDefaultValues();
    })

  }

  /* detector de cambio cambio en select */
  selectionChanged(event: any, element: string) {
    switch (element) {
      case 'insumo':
        this.directriz.id_insumo = event.value ? event.value.id : null;
        this.suppliesVersionsSelected = [];
        this.directriz.id_version_insumo = null;
        this.suppliesVersions = Array.from([]);
        const supplie = this.supplies.find(element => {
          if (element.id == this.directriz.id_insumo) {
            return element;
          }
        });
        if (supplie) {
          this.suppliesVersions = Array.from(supplie.versions);
        }
        break;
      case 'version_insumo':
        this.directriz.id_version_insumo = event.value ? event.value.id : null;
        this.suppliesVersionsSelected = this.suppliesVersions.filter(element => {
          if (element.id == this.directriz.id_version_insumo) {
            return element;
          }
        })
        break;
      case 'generico_especifico':
        this.genericSelected = event.value.name;
        if (event.value) {
          switch (event.value.name) {
            case 'Genérico'://1
              this.disabledVersionSelect = true;
              this.suppliesVersionsSelected = null;
              this.supplies = this.suppliesCopy.filter(element => {
                if (element.generico_especifico == 1) {
                  return element;
                }
              })
              break;
            case 'Específico'://0
              this.disabledVersionSelect = false;
              this.supplies = this.suppliesCopy.filter(element => {
                if (element.generico_especifico == 0) {
                  return element;
                }
              })
              break;
            default:
              // code...
              break;
          }
        }
        break;
      default:
        break;
    }
  }

  /*<<<<<<<<<<<<<<<<<<<<<<<MANEJO DE IMAGEN>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
  async fileProgress(fileInput: any, element: string) {
    this.fileData = <File>fileInput.target.files[0];
    this.preview(element);
  }

  preview(element: string) {
    if (
      this.fileData.type.match('image/png') ||
      this.fileData.type.match('image/jpg') ||
      this.fileData.type.match('image/jpeg')
    ) {
      switch (element) {
        case 'foto-original':
          this.purchaseNote.original = this.fileData;
          var reader = new FileReader();
          reader.readAsDataURL(this.fileData);
          reader.onload = _event => {
            this.previewOriginalUrl = reader.result;
          };
          break;
        case 'foto-rotulado':
          this.purchaseNote.labeled = this.fileData;
          var reader = new FileReader();
          reader.readAsDataURL(this.fileData);
          reader.onload = _event => {
            this.previewLabeledUrl = reader.result;
          };
          break;
        case 'directriz-image':
          this.directriz.image = this.fileData;
          var reader = new FileReader();
          reader.readAsDataURL(this.fileData);
          reader.onload = _event => {
            this.previewUrl = reader.result;
          };
          break;
        case 'supplie':
          this.supplieSelected.imagen = this.fileData;
          var reader = new FileReader();
          reader.readAsDataURL(this.fileData);
          reader.onload = _event => {
            this.previewUrl = reader.result;
          };
          break;
        case 'supplie-version':
          this.supplieVersionSelected.imagen = this.fileData;
          var reader = new FileReader();
          reader.readAsDataURL(this.fileData);
          reader.onload = _event => {
            this.previewUrl = reader.result;
          };
          break;

        default:
          // code...
          break;
      }

    } else {
      this.notificationService.showWarning('Formato no permitido', 'Solo se permite formato .png, .jpg, y .jpeg')
    }
  }
  /*edicion de elemento*/
  edit(directriz: Directriz, content: any) {
    this.directriz = Object.assign({}, directriz);
    this.previewUrl = this.directriz.image;
    this.supplieSelected = this.supplies.find(element => {
      return element.id == this.directriz.id_insumo;
    });
    const supplie = this.supplieSelected ? this.supplies.find(element => {
      if (element.id == this.supplieSelected.id) {
        return element;
      }
    }) : null;
    if (supplie) {
      const versions = supplie.versions;
      this.suppliesVersions = Array.from(versions);
    }

    this.suppliesVersionsSelected = this.suppliesVersions.filter(element => {
      if (element.id == this.directriz.id_version_insumo) {
        return element;
      }
    })
    this.modalRef = this.modalService.open(content, { size: 'lg' });
  }

  /*ordenado de listado por orden alfabetico*/
  sortTableBy(element: string) {
    switch (element) {
      case 'detalle':
        if (this.highestToLowest.detalle) {
          this.directrizs = this.directrizs.sort((a, b) => {
            if (a.detalle.toLowerCase() > b.detalle.toLowerCase()) return 1;
            if (a.detalle.toLowerCase() < b.detalle.toLowerCase()) return -1;
            return 0;
          });
        } else {
          this.directrizs = this.directrizs.sort((a, b) => {
            if (b.detalle.toLowerCase() > a.detalle.toLowerCase()) return 1;
            if (b.detalle.toLowerCase() < a.detalle.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.detalle = !this.highestToLowest.detalle;
        break;
      case 'image':
        if (this.highestToLowest.image) {
          this.directrizs = this.directrizs.sort((a, b) => {
            if (a.image.toLowerCase() > b.image.toLowerCase()) return 1;
            if (a.image.toLowerCase() < b.image.toLowerCase()) return -1;
            return 0;
          });
        } else {
          this.directrizs = this.directrizs.sort((a, b) => {
            if (b.image.toLowerCase() > a.image.toLowerCase()) return 1;
            if (b.image.toLowerCase() < a.image.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.image = !this.highestToLowest.image;
        break;
      case 'insumo':
        if (this.highestToLowest.insumo) {
          this.directrizs = this.directrizs.sort((a, b) => {
            if (a.insumo.descriptions.toLowerCase() > b.insumo.descriptions.toLowerCase()) return 1;
            if (a.insumo.descriptions.toLowerCase() < b.insumo.descriptions.toLowerCase()) return -1;
            return 0;
          });
        } else {
          this.directrizs = this.directrizs.sort((a, b) => {
            if (b.insumo.descriptions.toLowerCase() > a.insumo.descriptions.toLowerCase()) return 1;
            if (b.insumo.descriptions.toLowerCase() < a.insumo.descriptions.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.insumo = !this.highestToLowest.insumo;
        break;
      case 'version_product':
        if (this.highestToLowest.version_product) {
          this.directrizs = this.directrizs.sort((a, b) => {
            if (a.version_product.name.toLowerCase() > b.version_product.name.toLowerCase()) return 1;
            if (a.version_product.name.toLowerCase() < b.version_product.name.toLowerCase()) return -1;
            return 0;
          });
        } else {
          this.directrizs = this.directrizs.sort((a, b) => {
            if (b.version_product.name.toLowerCase() > a.version_product.name.toLowerCase()) return 1;
            if (b.version_product.name.toLowerCase() < a.version_product.name.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.version_product = !this.highestToLowest.version_product;
        break;
      case 'insumo_version':
        if (this.highestToLowest.insumo_version) {
          this.directrizs = this.directrizs.sort((a, b) => {
            if (a.version_insumo.nombre.toLowerCase() > b.version_insumo.nombre.toLowerCase()) return 1;
            if (a.version_insumo.nombre.toLowerCase() < b.version_insumo.nombre.toLowerCase()) return -1;
            return 0;
          });
        } else {
          this.directrizs = this.directrizs.sort((a, b) => {
            if (b.version_insumo.nombre.toLowerCase() > a.version_insumo.nombre.toLowerCase()) return 1;
            if (b.version_insumo.nombre.toLowerCase() < a.version_insumo.nombre.toLowerCase()) return -1;
            return 0;
          });
        }
        this.highestToLowest.insumo_version = !this.highestToLowest.insumo_version;
        break;

      default:
        // code...
        break;
    }
  }
  /*abre modal*/
  openImage(content: any, image: string, name?: string) {
    this.imageName = name ? name : null;
    this.galleryPhotos.sort(function (a, b) {
      if (a.small !== image && a.medium !== image && a.big !== image) {
        return 1;
      }
      if (a.small == image && a.medium == image && a.big == image) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
    this.modalRef = this.modalService.open(content, { size: 'lg' });
  }
  /*openGalleryImage(index:number,image:string){
    this.imageGallerySelected={
      index:index,
      src:image
    };
  }
  closeGalleryImage(){
    this.imageGallerySelected.index=null;
    this.imageGallerySelected.src=null
  }
  changeGalleryImage(index:number,arrow:string){
    if(index>=0 && index<=9){
      index=arrow=='next'?index+1:index-1;
      this.imageGallerySelected.index=index;
      this.imageGallerySelected.src=this.images[index].src
    }
  }*/
  /*generacion de reporte en pdf*/
  generateReport() {
    let imgLoaded = 0;
    let index = 0;
    let logoLoaded = false;
    let directrizs = this.directrizs;
    let elementLength = this.directrizs.length % 2 == 0 ? this.directrizs.length : this.directrizs.length + 1;
    let product = this.product;
    let versionProduct = this.versionProduct;

    const doc = new jsPDF();

    const imgLogo = new Image;
    let logoImgData = null;
    imgLogo.onload = function () {
      logoImgData = this;
      //cabecera1
      doc.autoTable(null, [[null, null, null]], {
        theme: 'grid',
        columnHeight: 'wrap',
        columnStyles: {
          0: { minCellHeight: '20', halign: 'center', valign: 'center' },
          1: { fontStyle: 'bold', halign: 'center', valign: 'center' },
          2: { fontStyle: 'bold', halign: 'center', valign: 'center' }
        },
        bodyStyles: { lineColor: [0, 0, 0], fontSize: 8 },
        didDrawCell: function (data) {
          const raw = data.column.raw;
          data.cell.height = 20;
          data.cell.contentHeight = 20;
          const cell = data.cell;
          if (raw.dataKey == 0) {
            imgLoaded++;
            logoLoaded = true;
            if (data.pageNumber == 1) {
              logoImgData.width = cell.width - 5;
              logoImgData.height = cell.height - 5;
              doc.addImage(logoImgData, cell.x + 2, cell.y + 2, cell.width - 5, cell.height - 5);
              if (index == directrizs.length && logoLoaded) {
                doc.save('reporte_' + Math.random() + '_directriz_' + Math.random() + '.pdf');
              }
            }
          }
          if (raw.dataKey == 1) {
            doc.text('FICHA DE ACONDICIONAMIENTO', cell.x + 5, (cell.y + cell.height / 2))
          }
          if (raw.dataKey == 2) {
            doc.rect(cell.x, cell.y, cell.width, cell.height / 3, 'S')
            doc.text('FECHA DE REVISIÓN', cell.x + 1, (cell.y + 4))
            doc.text(moment().format('YYYY-MM-DD'), cell.x + ((cell.width / 2) + 1), (cell.y + 4))

            /*doc.rect(cell.x, cell.y+cell.height/3, cell.width, cell.height/3, 'S')
            doc.text('LOTE', cell.x+1, (cell.y+cell.height/2))
            doc.text(product.lot?product.lot.name:'Sin lote registrado', cell.x+((cell.width/2)+1), (cell.y+cell.height/2))*/

            doc.rect(cell.x + cell.width / 2, cell.y, cell.width / 2, cell.height, 'S')
            doc.text('VERSIÓN', cell.x + 1, (cell.y + cell.height - 3))
            doc.text(versionProduct.name, cell.x + ((cell.width / 2) + 1), (cell.y + cell.height - 3))
          }
        },
      });
      //tabla1
      /*doc.autoTable(null,[[null,null]],{
        theme: 'grid',
        tableWidth:100,
        margin:{
          left:95
        },
        columnHeight: 'wrap',               
        columnStyles: {
            0: {cellWidth: 30,fillColor: [237, 237, 237],minCellHeight: '20',fontStyle:'bold',halign: 'center',valign: 'center'},
            1: {minCellHeight: '20',fontStyle:'bold',halign: 'center',valign: 'center'}
        },
        bodyStyles: {lineColor: [0, 0, 0],fontSize: 8},
        styles: {
            halign: 'right'
        },
        didDrawCell: function (data) {
            const raw = data.column.raw;
            data.cell.height=20;
            data.cell.contentHeight=20;                  
            const cell = data.cell;
            if(raw.dataKey==0){
              doc.rect(cell.x, cell.y, cell.width, cell.height/3, 'S')
              doc.text('FECHA', cell.x+1, (cell.y+4))

              doc.rect(cell.x, cell.y+cell.height/3, cell.width, cell.height/3, 'S')
              doc.text('RESPONSABLE', cell.x+1, (cell.y+cell.height/2))

              doc.text('CARGO', cell.x+1, (cell.y+cell.height-3))

            }
            if(raw.dataKey==1){
              doc.rect(cell.x, cell.y, cell.width, cell.height/3, 'S')
              doc.text('07/12/2018', cell.x+1, (cell.y+4))

              doc.rect(cell.x, cell.y+cell.height/3, cell.width, cell.height/3, 'S')
              doc.text('CARMEN YÁÑEZ', cell.x+1, (cell.y+cell.height/2))

              doc.text('ASISTENTES DE ASUNTOS REGULATORIOS', cell.x+1, (cell.y+cell.height-3))

            }
        },            
      });*/
      //tabla2
      doc.autoTable(null, [[null]], {
        theme: 'grid',
        columnHeight: 'wrap',
        columnStyles: {
          0: { minCellHeight: '20', fontStyle: 'bold', halign: 'center', valign: 'center' },
          1: { minCellHeight: '20', fontStyle: 'bold', halign: 'center', valign: 'center' }
        },
        bodyStyles: { lineColor: [0, 0, 0], fontSize: 8 },
        styles: {
          halign: 'right'
        },
        didDrawCell: function (data) {
          const raw = data.column.raw;
          const cell = data.cell;

          if (raw.dataKey == 0) {
            doc.setDrawColor(0);
            doc.setFillColor(255, 204, 0);
            doc.rect(cell.x, cell.y, cell.width, cell.height / 2, 'FD')
            doc.text('ANTECEDENTES', (cell.x + (cell.width / 2)) - 10, (cell.y + 5))

            doc.setDrawColor(0);
            doc.setFillColor(237, 237, 237);
            doc.rect(cell.x, cell.y + (cell.height / 2), cell.width - 160, cell.height / 2, 'FD')
            doc.text('PRODUCTO', cell.x + 1, (cell.y + (cell.height / 2)) + 5)

            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.rect(cell.x + cell.width - 160, cell.y + (cell.height / 2), cell.width / 2, cell.height / 2, 'FD')
            doc.text(product.descriptions, cell.x + cell.width - 160 + 1, (cell.y + (cell.height / 2)) + 5)

            doc.setDrawColor(0);
            doc.setFillColor(237, 237, 237);
            doc.rect(cell.x + cell.width - 160 + (cell.width / 2), cell.y + (cell.height / 2), cell.width - 150, cell.height / 2, 'FD')
            doc.text('MARCA', cell.x + cell.width - 160 + (cell.width / 2) + 1, (cell.y + (cell.height / 2)) + 5)


            doc.setDrawColor(0);
            doc.setFillColor(255, 255, 255);
            doc.text(product.product_brand.name, cell.x + cell.width - 160 + (cell.width / 2) + (cell.width - 150) + 1, (cell.y + (cell.height / 2)) + 5)
          }
        },
      });
      //table3
      let directricesData = [];
      let arrayRows = [];
      for (var i = 0; i < elementLength; i = i + 2) {
        arrayRows.push([null, null])
      }
      for (let i = 0; i < directrizs.length; i++) {
        const imgDirectriz = new Image;
        const text = directrizs[i].detalle;
        imgDirectriz.onload = function () {
          imgLoaded++;
          directricesData.push({ text: text, img: this })
          if (i + 1 == directrizs.length) {
            doc.autoTable(null, arrayRows, {
              theme: 'grid',
              columnHeight: 'wrap',
              rowPageBreak: 'avoid',
              columnStyles: {
                0: { minCellHeight: '80', fontStyle: 'bold', halign: 'center', valign: 'center' },
                1: { minCellHeight: '80', fontStyle: 'bold', halign: 'center', valign: 'center' }
              },
              bodyStyles: { lineColor: [0, 0, 0], fontSize: 8 },
              styles: {
                halign: 'right'
              },
              didDrawCell: function (data) {
                const raw = data.column.raw;
                const row = data.row;
                const cell = data.cell;
                if (directricesData[index]) {
                  //rect
                  doc.setDrawColor(0);
                  doc.setFillColor(255, 204, 0);
                  doc.rect(cell.x, cell.y, cell.width, cell.height / 7, 'FD')
                  //text
                  let yText = (cell.y + 5);
                  let xText = (cell.x + (cell.width / 7)) - 10;
                  doc.text(directricesData[index].text, xText, yText);
                  //image
                  let xImg = cell.x + 2;
                  let yImg = cell.y + (cell.height / 7) + 2;
                  doc.addImage(directricesData[index].img, xImg, yImg, cell.width - 5, cell.height - (cell.height / 7) - 5);
                  //download
                  if (index + 1 == directrizs.length && logoLoaded) {
                    doc.save('reporte_' + Math.random() + '_directriz_' + Math.random() + '.pdf');
                  }
                  index++;
                }
              }
            });
          }
        };
        if (directrizs[i].ib64) {
          imgDirectriz.setAttribute('crossorigin', 'anonymous');
          imgDirectriz.src = directrizs[i].ib64;
        } else {
          imgDirectriz.src = 'assets/img/brand/nutra.png';
        }
      }
    };
    imgLogo.src = 'assets/img/brand/nutra.png';
  }
  showSupplieVersionForm(supplieVersion: any, content: any) {
    if (supplieVersion) {
      this.supplieVersionSelected = Object.assign({}, supplieVersion);
      if (this.supplieVersionSelected) {
        this.previewUrl = this.supplieVersionSelected.imagen;
        this.supplieSelected = this.supplies.find(element => {
          return element.id == this.supplieVersionSelected.id_insumo;
        });
        this.modalRef = this.modalService.open(content, { size: 'lg' });
      }
    }
  }
  showSupplieForm(supplie: any, content: any) {
    if (supplie) {
      this.supplieSelected = Object.assign({}, supplie);
      if (this.supplieSelected) {
        this.previewUrl = this.supplieSelected.imagen;
        this.groupSelected = this.groups.find(element => {
          return element.id == this.supplieSelected.id_grupo;
        });
        this.modalRef = this.modalService.open(content, { size: 'lg' });
      }
    }

  }
  updateSupplieVersion() {
    if (this.supplieVersionSelected.id) {
      this.spinner.show();
      this.supplieVersionService.updateElement(this.supplieVersionSelected.id, this.getFormData('supplie-version')).toPromise().then(
        response => {
          if (response != undefined && response.data) {
            this.supplies = this.supplies.map(element => {
              if (element.id == response.data.id_insumo) {
                element.versions = element.versions.map(element_version => {
                  return element_version.id == response.data.id ? response.data : element_version;
                })
              }
              return element;
            })
            this.directrizs = this.directrizs.map(element => {
              if (element.version_insumo.id == response.data.id) {
                element.version_insumo = response.data
                element.id_version_insumo = response.data.id
              }
              return element;
            })
            this.spinner.hide();
            this.notificationService.showSuccess('Operación realiza exitosamente', response.message)
            this.modalRef.close();
            this.setDefaultValues();
          }
        }
      ).catch(
        error => {
          this.spinner.hide();
          if (error.error)
            this.notificationService.showError('Error', error.error)
        }
      );
    }
  }
  /* registra o actualiza elemento */
  updateSupplie() {
    if (this.supplieSelected.id) {
      this.spinner.show();
      this.supplieService.updateElement(this.supplieSelected.id, this.getFormData('supplie')).toPromise().then(
        response => {
          if (response != undefined && response.data) {
            this.supplies = this.supplies.map(element => {
              return element.id == response.data.id ? response.data : element;
            })
            this.directrizs = this.directrizs.map(element => {
              if (element.insumo.id == response.data.id) {
                element.insumo = response.data
                element.id_insumo = response.data.id
              }
              return element;
            })
            this.spinner.hide();
            this.notificationService.showSuccess('Operación realiza exitosamente', response.message)
            this.modalRef.close();
            this.setDefaultValues();
          }
        }
      ).catch(
        error => {
          this.spinner.hide();
          if (error.error)
            this.notificationService.showError('Error', error.error)
        }
      );
    }
  }
  /*cierra el modal del formulario*/
  closeFormModal() {
    this.modalRef.close();
    this.setDefaultValues();
    this.imageName = null;
  }
  changeEvent($event) {
    if ($event.image?.big && $event.image?.medium && $event.image?.small) {
      const find = this.images.find(e => e.src == $event.image.big)
      this.imageName = find?.title ? find.title : null;
    }
  }
  ngOnDestroy() {
  }
}
