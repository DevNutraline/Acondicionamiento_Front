import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterProductTypeOVA'
})
export class FilterProductTypeOVAPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.name.toLowerCase().includes(searchText) || 
	      		element.descriptions.toLowerCase().includes(searchText)
	      	;
	    });
   }

}