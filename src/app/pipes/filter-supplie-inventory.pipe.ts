import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterSupplieInventory'
})
export class FilterSupplieInventoryPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.insumo.cod_interno.toLowerCase().includes(searchText) || 
	      		element.insumo.cod_sap.toLowerCase().includes(searchText) || 
	      		element.insumo.descriptions.toLowerCase().includes(searchText) || 
	      		element.insumo.tamano.toLowerCase().includes(searchText) 
	      	;
	    });
   }

}