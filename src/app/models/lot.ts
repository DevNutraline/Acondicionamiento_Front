import { Product } from "src/app/models/product";
export class Lot {
    id: number;
    name: string;
    image:any;
    id_product:any;
    product: Product;
    created_at: Date;
    updated_at: Date;
}