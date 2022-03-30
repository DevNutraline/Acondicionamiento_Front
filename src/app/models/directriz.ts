import { Supplie } from "src/app/models/supplie";
import { VersionProduct } from "src/app/models/version-product";
import { Product } from "src/app/models/product";
import { SupplieVersion } from "src/app/models/supplie-version";
export class Directriz {
    id: number;
    detalle: string;
    image: any;
    id_insumo: number;
    id_version_product: number;
    id_version_insumo :number;
    insumo:Supplie;
    version_product:VersionProduct;
    version_insumo:SupplieVersion;
    product:Product;
    ib64:string; //image base64
    created_at: Date;
    updated_at: Date;
}