import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterSupplie'
})
export class FilterSuppliePipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
		    return element.cod_interno.toLowerCase().includes(searchText) || 
	      	 	element.cod_sap.toLowerCase().includes(searchText) || 
	      		element.descriptions.toLowerCase().includes(searchText) || 
		      	element.group.descriptions.toLowerCase().includes(searchText) || 
		      	element.tamano.toLowerCase().includes(searchText)
	      	;
	    });
   }

}
