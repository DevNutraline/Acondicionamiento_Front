import { Product } from "src/app/models/product";
import { Factura } from "src/app/models/factura";
import { VersionProduct } from "src/app/models/version-product";
import { ProductReceptionByVersion } from "src/app/models/product-reception-by-version";
import { ProductTypeOVA } from "src/app/models/product-type-ova";
import { OVAProcessType } from "src/app/models/ova-process-type";
import { Lot } from "src/app/models/lot";

export class ProductReception {
    id: number;
    id_product:number;
    product:Product;
    id_factura:number;
    factura:Factura;
    last_id_version_product: number;
    last_quantity_reported:number;
    version_product:VersionProduct;
    last_id_ova_product_type:number;
    product_type_o_v_a:ProductTypeOVA;
    custom_to:string;
    last_id_ova_process_type:number;
    ova_process_type:OVAProcessType;
    custom_pt:string;
    last_id_lot:number;
    lot:Lot;
    product_reception_by_version:ProductReceptionByVersion[];
    quantity:number;
    quantity_reported: number;
    quantity_process: number;
    total_processed: number;
    cod_carpeta:string;
    status:string;
    checked:boolean;
    advance:number;
    total_advance:number;
    created_at: Date;
    updated_at: Date;
}