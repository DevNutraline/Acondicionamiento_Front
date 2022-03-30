import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterSupplieGroup'
})
export class FilterSupplieGroupPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.descriptions.toLowerCase().includes(searchText)
	      	;
	    });
   }

}