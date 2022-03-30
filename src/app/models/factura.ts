import { ProductReception } from "src/app/models/product-reception";
import { ProductReceivedByVersion } from "src/app/models/product-received-by-version";
export class Factura {
    id: number;
    folioNum: number;
    docDate: Date;
    docDueDate: Date;
    cardCode: string;
    cardName: string;
    id_carpeta: number;
    products_reception:ProductReception[];
    products_received_by_version:ProductReceivedByVersion[];
    created_at: Date;
    updated_at: Date;
}