import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';

import { BsDropdownModule } from 'ngx-bootstrap';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule } from '@angular/forms';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
// Import the library
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';

import { DashboardComponent } from './dashboard/dashboard.component';
import { AlternativeComponent } from './alternative/alternative.component';
import { UsersComponent } from './users/users.component';
import { SuppliesComponent } from './supplies/supplies.component';
import { SuppliesVersionsComponent } from './supplies-versions/supplies-versions.component';
import { FoldersComponent } from './folders/folders.component';
import { RecipientsComponent } from './recipients/recipients.component';
import { GroupsComponent } from './groups/groups.component';
import { RolsComponent } from './rols/rols.component';
import { SupplieInventoryComponent } from './supplie-inventory/supplie-inventory.component';
import { MovementHistoryComponent } from './movement-history/movement-history.component';
import { ProductsComponent } from './products/products.component';
import { OvaProcessTypesComponent } from './ova-process-types/ova-process-types.component';
import { ProductTypeOVAsComponent } from './product-type-ovas/product-type-ovas.component';
import { ProductReceptionComponent } from './product-reception/product-reception.component';
import { ProductVersionsComponent } from './product-versions/product-versions.component';
import { ProductVersionFormComponent } from './product-version-form/product-version-form.component';
import { DirectrizComponent } from './directriz/directriz.component';
import { PurchaseSuppliesComponent } from './purchase-supplies/purchase-supplies.component';
import { OvaComponent } from './ova/ova.component';
import { ProductBrandComponent } from './product-brand/product-brand.component';
import { LotComponent } from './lot/lot.component';
import { ProductsByInvoiceComponent } from './products-by-invoice/products-by-invoice.component';
import { ProductsByFolderComponent } from './products-by-folder/products-by-folder.component';
import { SaleNoteComponent } from './sale-note/sale-note.component';
import { SupplieInventoryComparativeComponent } from './supplie-inventory-comparative/supplie-inventory-comparative.component';


import { RouterModule } from '@angular/router';
import { DashboardsRoutes } from './dashboards.routing';

import { FilterMovementPipe } from '../../pipes/filter-movement.pipe';
import { FilterProductPipe } from '../../pipes/filter-product.pipe';
import { FilterSuppliePipe } from '../../pipes/filter-supplie.pipe';
import { FilterOVAProcessTypePipe } from '../../pipes/filter-ova-process-type.pipe';
import { FilterCarpetaPipe } from '../../pipes/filter-carpeta.pipe';
import { FilterSupplieGroupPipe } from '../../pipes/filter-supplie-group.pipe';
import { FilterProductTypeOVAPipe } from '../../pipes/filter-product-type-ova.pipe';
import { FilterProductReceptionPipe } from '../../pipes/filter-product-reception.pipe';
import { FilterProductVersionPipe } from '../../pipes/filter-product-version.pipe';
import { FilterUserPipe } from '../../pipes/filter-user.pipe';
import { FilterRolePipe } from '../../pipes/filter-role.pipe';
import { FilterSupplieInventoryPipe } from '../../pipes/filter-supplie-inventory.pipe';
import { FilterSupplieVersionPipe } from '../../pipes/filter-supplie-version.pipe';
import { FilterRecipientPipe } from '../../pipes/filter-recipient.pipe';
import { FilterDirectrizPipe } from '../../pipes/filter-directriz.pipe';
import { FilterPurchaseSuppliesPipe } from '../../pipes/filter-purchase-supplies.pipe';
import { FilterProductBrandPipe } from '../../pipes/filter-product-brand.pipe';
import { FilterFacturaPipe } from '../../pipes/filter-factura.pipe';
import { FilterLotPipe } from '../../pipes/filter-lot.pipe';
import { FilterPreviewProductReceptionPipe } from '../../pipes/filter-preview-product-reception.pipe';
import { FilterSupplieInventoryComparativePipe } from '../../pipes/filter-supplie-inventory-comparative.pipe';


@NgModule({
  declarations: [
    DashboardComponent, 
    AlternativeComponent, 
    UsersComponent,
    SuppliesComponent,
    SuppliesVersionsComponent,
    FoldersComponent,
    RecipientsComponent,
    GroupsComponent,
    RolsComponent,
    SupplieInventoryComponent,
    MovementHistoryComponent,
    ProductsComponent,
    OvaProcessTypesComponent,
    ProductTypeOVAsComponent,
    ProductReceptionComponent,
    ProductVersionsComponent,
    ProductVersionFormComponent,
    DirectrizComponent,
    PurchaseSuppliesComponent,
    ProductBrandComponent,
    OvaComponent,
    LotComponent,
    ProductsByInvoiceComponent,
    ProductsByFolderComponent,
    SaleNoteComponent,
    SupplieInventoryComparativeComponent,
    FilterMovementPipe,
    FilterProductPipe,
    FilterOVAProcessTypePipe,
    FilterSuppliePipe,
    FilterCarpetaPipe,
    FilterSupplieGroupPipe,
    FilterProductTypeOVAPipe,
    FilterProductReceptionPipe,
    FilterProductVersionPipe,
    FilterUserPipe,
    FilterRolePipe,
    FilterSupplieInventoryPipe,
    FilterSupplieVersionPipe,
    FilterRecipientPipe,
    FilterDirectrizPipe,
    FilterPurchaseSuppliesPipe,    
    FilterProductBrandPipe,
    FilterFacturaPipe,
    FilterLotPipe,
    FilterPreviewProductReceptionPipe,
    FilterSupplieInventoryComparativePipe
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    NgbModule,
    FormsModule,
    SelectDropDownModule,
    NgxPaginationModule,
    NgxImageZoomModule,
    NgxGalleryModule,
    BsDropdownModule.forRoot(),
    ProgressbarModule.forRoot(),
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    RouterModule.forChild(DashboardsRoutes)
  ],
  exports: [
    DashboardComponent,
    AlternativeComponent,
    UsersComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardsModule {}
