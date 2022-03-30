import { ProductReception } from "src/app/models/product-reception";
export class ProductReceptionByVersion {
    id: number;
    id_product_reception:number;
    id_version_product:number;
    quantity_reported:number; 
    product_reception:ProductReception;
    created_at: Date;
    updated_at: Date;
}