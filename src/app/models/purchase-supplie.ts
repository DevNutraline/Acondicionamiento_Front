import { Supplie } from "src/app/models/supplie";
export class PurchaseSupplie {
    id: number;    
    supplie: Supplie;
    stock: number;
    cantidad_oc:number;
    cantidad_fr:number;
    a_comprar: number;
    created_at: Date;
    updated_at: Date;
}