import { PurchaseSupplie } from "src/app/models/purchase-supplie";
export class PurchaseSupplieVersion {
	id: number;
	id_insumo: number;
	imagen: string;
	nombre: string;
	purchase_supplie: PurchaseSupplie;
	created_at: Date;
	updated_at: Date;
}