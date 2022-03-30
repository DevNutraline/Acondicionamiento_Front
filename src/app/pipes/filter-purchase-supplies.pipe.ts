import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterPurchaseSupplies'
})
export class FilterPurchaseSuppliesPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
		if(!items) return [];
		if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
		return element.supplie.cod_interno.toLowerCase().includes(searchText) || 
				element.supplie.cod_sap.toLowerCase().includes(searchText) || 
				element.supplie.descriptions.toLowerCase().includes(searchText) || 
				element.supplie.group.descriptions.toLowerCase().includes(searchText) || 
				element.supplie.tamano.toLowerCase().includes(searchText) || 
				element.stock.toString().toLowerCase().includes(searchText) ||
				element.supplie.en_transito.toString().toLowerCase().includes(searchText) ||
				element.cantidad_oc.toString().toLowerCase().includes(searchText) ||
				element.cantidad_fr.toString().toLowerCase().includes(searchText) ||
				element.a_comprar.toString().toLowerCase().includes(searchText);
		});
	}
}