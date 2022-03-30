import { Product } from "src/app/models/product";
import { VersionProduct } from "src/app/models/version-product";

export class PurchaseNote {
    id: number;
    original: any; 
    labeled: any;
    note: string;
    id_product:number;
    product:Product;
    id_version_product: number;
    version_product:VersionProduct;
    created_at: Date;
    updated_at: Date;
}
