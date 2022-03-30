import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterMovement'
})
export class FilterMovementPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.movement.toLowerCase().includes(searchText) || 
	      		element.insumo.descriptions.toLowerCase().includes(searchText) || 
		      	element.insumo.cod_interno.toLowerCase().includes(searchText) || 
		      	element.insumo.cod_sap.toLowerCase().includes(searchText)
	      	;
	    });
   }

}