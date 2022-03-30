import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterSupplieInventoryComparative'
})
export class FilterSupplieInventoryComparativePipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.supplie_inventory.insumo.cod_interno.toLowerCase().includes(searchText) || 
	      		element.supplie_inventory.insumo.cod_sap.toLowerCase().includes(searchText) || 
	      		element.supplie_inventory.insumo.descriptions.toLowerCase().includes(searchText) || 
	      		element.supplie_inventory.insumo.tamano.toLowerCase().includes(searchText) || 
	      		element.supplie_inventory.cantidad.toString().toLowerCase().includes(searchText) ||
	      		element.cantidad_sap.toString().toLowerCase().includes(searchText) ||
	      		element.difference_quantities.toString().toLowerCase().includes(searchText) 

	      	;
	    });
   }

}