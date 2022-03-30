import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterProductReception'
})
export class FilterProductReceptionPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
		if(!items) return [];
		if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
			let result=null;
			if(element.quantity)
				result=result || element.quantity.toString().toLowerCase().includes(searchText);

			if(element.status)
				result=result || element.status.toString().toLowerCase().includes(searchText);

			if(element.product && element.product.cod_sap)
				result=result || element.product.cod_sap.toLowerCase().includes(searchText)
			
			if(element.product && element.product.descriptions)
				result=result || element.product.descriptions.toLowerCase().includes(searchText)
			
			if(element.product && element.product.product_brand && element.product.product_brand.name)
				result=result || element.product.product_brand.name.toLowerCase().includes(searchText)
			
			if(element.product && element.product.ova_product_type && element.product.ova_product_type.name)
				result=result || element.product.ova_product_type.name.toLowerCase().includes(searchText)
			
			if(element.product && element.product.factura && element.product.factura.folioNum)
				result=result || element.product.factura.folioNum.toString().toLowerCase().includes(searchText)
			
			if(element.product && element.product.ova_process_type && element.product.ova_process_type.name)
				result=result || element.product.ova_process_type.name.toLowerCase().includes(searchText)

			if(element.product_reception && element.product_reception.product && element.product_reception.product.cod_sap)
				result=result || element.product_reception.product.cod_sap.toLowerCase().includes(searchText)

			if(element.product_reception && element.product_reception.product && element.product_reception.product.descriptions)
				result=result || element.product_reception.product.descriptions.toLowerCase().includes(searchText)
			
			if(element.version && element.version.name)
				result=result || element.version.name.toLowerCase().includes(searchText)

			return result;
		});
	}

}