import { Group } from "src/app/models/group";
import { SupplieVersion } from "src/app/models/supplie-version";
import { Directriz } from "src/app/models/directriz";
export class Supplie {
    id: number;
    id_grupo: number; 
    cod_interno: string;
    cod_sap: string;
    descriptions: string;
    en_transito: number;
    generico_especifico:number;
    tamano: string;
    inventariado: number;
    informar: number;
    comprar: number;
    imagen: any;
    // join de PurchaseSuppliesController
    version_insumos_id:number;
    version_insumos_nombre:string;
    version_insumos_stock:number;
    // join de PurchaseSuppliesController
    group:Group;
    directrizs:Directriz[];
    versions:SupplieVersion[];
    created_at: Date;
    updated_at: Date;
    constructor(){
        this.inventariado=1;
        this.generico_especifico=1;
        this.informar=1;
        this.comprar=1;
    }
}