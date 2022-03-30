export class Product {
    id: number;
    descriptions: string;
    cod_sap: string;
    created_at: Date;
    updated_at: Date;
}
export class VersionProduct {
    id: number;
    name: string;
    id_product:number;
    imagenMainFace:any;
    imagenNutritionalInformation1:any;
    imagenNutritionalInformation2:any;//opc
    imagenClaimsYMarketing1:any;
    imagenClaimsYMarketing2:any;//opc
    imagenProductVersion:any;
    imagenEAN13:any;
    imagenAditional1:any;//opc
    imagenAditional2:any;//opc
    imagenAditional3:any;//opc
    product: Product;
    created_at: Date;
    updated_at: Date;
}