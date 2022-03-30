import { Routes } from "@angular/router";

import { DashboardComponent } from "./dashboard/dashboard.component";
import { AlternativeComponent } from "./alternative/alternative.component";
import { UsersComponent } from "./users/users.component";
import { SuppliesComponent } from "./supplies/supplies.component";
import { FoldersComponent } from "./folders/folders.component";
import { SuppliesVersionsComponent } from "./supplies-versions/supplies-versions.component";
import { RecipientsComponent } from "./recipients/recipients.component";
import { GroupsComponent } from "./groups/groups.component";
import { RolsComponent } from "./rols/rols.component";
import { SupplieInventoryComponent } from "./supplie-inventory/supplie-inventory.component";
import { MovementHistoryComponent } from "./movement-history/movement-history.component";
import { ProductsComponent } from "./products/products.component";
import { OvaProcessTypesComponent } from "./ova-process-types/ova-process-types.component";
import { ProductTypeOVAsComponent } from "./product-type-ovas/product-type-ovas.component";
import { ProductReceptionComponent } from "./product-reception/product-reception.component";
import { ProductVersionsComponent } from "./product-versions/product-versions.component";
import { ProductVersionFormComponent } from "./product-version-form/product-version-form.component";
import { DirectrizComponent } from './directriz/directriz.component';
import { PurchaseSuppliesComponent } from './purchase-supplies/purchase-supplies.component';
import { ProductBrandComponent } from './product-brand/product-brand.component';
import { OvaComponent } from './ova/ova.component';
import { LotComponent } from './lot/lot.component';
import { ProductsByInvoiceComponent } from './products-by-invoice/products-by-invoice.component';
import { ProductsByFolderComponent } from './products-by-folder/products-by-folder.component';
import { SaleNoteComponent } from './sale-note/sale-note.component';
import { SupplieInventoryComparativeComponent } from './supplie-inventory-comparative/supplie-inventory-comparative.component';


export const DashboardsRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "dashboard",
        component: DashboardComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "alternative",
        component: AlternativeComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "users",
        component: UsersComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "supplies",//insumos
        component: SuppliesComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "folders",
        component: FoldersComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "supplies-versions",
        component: SuppliesVersionsComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "supplies-versions/:element/:id",
        component: SuppliesVersionsComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "recipients",
        component: RecipientsComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "groups",
        component: GroupsComponent
      }
    ]
  }, 
  {
    path: "",
    children: [
      {
        path: "rols",
        component: RolsComponent
      }
    ]
  }, 
  {
    path: "",
    children: [
      {
        path: "supplie-inventory",
        component: SupplieInventoryComponent
      }
    ]
  }, 
  {
    path: "",
    children: [
      {
        path: "movement-history",
        component: MovementHistoryComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "products",
        component: ProductsComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "products/:foldercode/:facturaid",
        component: ProductsComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "ova-process-types",
        component: OvaProcessTypesComponent
      }
    ]
  }, 
  {
    path: "",
    children: [
      {
        path: "product-type-ovas",
        component: ProductTypeOVAsComponent
      }
    ]
  }, 
  {
    path: "",
    children: [
      {
        path: "product-reception",
        component: ProductReceptionComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "product-reception/:foldercode/:facturaid",
        component: ProductReceptionComponent
      }
    ]
  }, 
  {
    path: "",
    children: [
      {
        path: "product-versions",
        component: ProductVersionsComponent
      }
    ]
  },  
  {
    path: "",
    children: [
      {
        path: "product-version-form",
        component: ProductVersionFormComponent
      }
    ]
  }, 
  {
    path: "",
    children: [
      {
        path: "product-version-form/:element/:id",
        component: ProductVersionFormComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "product-version-form/:element/:id/:foldercode/:facturaid/:productreceptionid",
        component: ProductVersionFormComponent
      }
    ]
  },    
  {
    path: "",
    children: [
      {
        path: "directriz/:id",
        component: DirectrizComponent
      }
    ]
  }, 
  {
    path: "",
    children: [
      {
        path: "purchase-supplies",
        component: PurchaseSuppliesComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "ova",
        component: OvaComponent
      }
    ]
  } ,
  {
    path: "",
    children: [
      {
        path: "product-brand",
        component: ProductBrandComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "lot",
        component: LotComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "lot/:foldercode/:facturaid/:productreceptionid/:productid",
        component: LotComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "lot/:element/:productid",
        component: LotComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "products-by-invoice/:id",
        component: ProductsByInvoiceComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "products-by-folder/:id",
        component: ProductsByFolderComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "sale-note",
        component: SaleNoteComponent
      }
    ]
  },
  {
    path: "",
    children: [
      {
        path: "supplie-inventory-comparative",
        component: SupplieInventoryComparativeComponent
      }
    ]
  },


];
