import { OVAProcessType } from "src/app/models/ova-process-type";
import { Factura } from "src/app/models/factura";
import { ProductTypeOVA } from "src/app/models/product-type-ova";
import { ProductBrand } from "src/app/models/product-brand";
export class Product {
    id: number;
    cod_sap: string;
    name:string;
    descriptions: string;
    codgf:string;
    itemGF:string;
    foldercode:string;
    versions:any[];//nombre de version de producto
    product_invoice:any[];
    id_product_brand: number; 
    product_brand: ProductBrand;
    id_ova_process_type: number; 
    ova_process_type: OVAProcessType;
    id_ova_product_type: number;
    ova_product_type: ProductTypeOVA;
    id_lot: number;
    id_factura: number;
    factura: Factura;
    created_at: Date;
    updated_at: Date;
}
