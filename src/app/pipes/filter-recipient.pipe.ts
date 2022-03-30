import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterRecipient'
})
export class FilterRecipientPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.name.toLowerCase().includes(searchText) || 
	      		element.last_name.toLowerCase().includes(searchText) || 
	      		element.email.toLowerCase().includes(searchText) || 
	      		element.inventario.includes(searchText) || 
		      	element.ova.includes(searchText) || 
		      	element.product.includes(searchText)
	      	;
	    });
   }

}