import { Factura } from "src/app/models/factura";
import { Product } from "src/app/models/product";

export class Folder {
    id: number;
    cod_carpeta: string;
    u_NXBL:string;
    u_NXNave:string;
    u_NXFechaArribo:Date;
    status:string; 
    type:string;
    commercial_status:string;
    priority:string;
    closed_at:Date;
    date_released_sale:Date;
    arrival_date:Date;
    ova_start_date:Date;
    ova_start_estimated_date:Date | string;
    ova_end_estimated_date:Date | string;
    facturas:Factura[];
    products:Product[];
    created_at: Date;
    updated_at: Date;
}