import { Supplie } from "src/app/models/supplie";
export class SupplieVersion {
    id: number;
    nombre: string;
    imagen: any;
    stock:number;
    id_insumo:number;
    insumo: Supplie;
    created_at: Date;
    updated_at: Date;
}