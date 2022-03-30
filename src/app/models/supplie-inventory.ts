import { Supplie } from "src/app/models/supplie";
import { SupplieVersion } from "src/app/models/supplie-version";
export class SupplieInventory {
    id: number;    
    cantidad:number;
    movement:string;
    doc_origen:string;
    observations:string;
    id_user: number;
    id_insumo:number;
    insumo: Supplie;    
    id_version_insumo :number;
    version_insumo:SupplieVersion;
    created_at: Date;
    updated_at: Date;
}

