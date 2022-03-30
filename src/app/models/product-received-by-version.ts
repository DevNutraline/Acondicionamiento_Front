import { ProductReception } from "src/app/models/product-reception";
import { VersionProduct } from "src/app/models/version-product";

export class ProductReceivedByVersion {
    id: number;
    id_factura:number;
    id_product_reception:number;
    id_version_product:number;
    quantity_received:number; 
    quantity_process:number; 
    status:string;
    product_reception:ProductReception;
    version:VersionProduct;
    created_at: Date;
    updated_at: Date;
}