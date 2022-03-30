import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterSupplieVersion'
})
export class FilterSupplieVersionPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.nombre.toLowerCase().includes(searchText) || 
	      		element.insumo.descriptions.toLowerCase().includes(searchText) 
	      	;
	    });
   }

}