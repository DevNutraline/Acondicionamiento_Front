import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterProductBrand'
})
export class FilterProductBrandPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.name.toLowerCase().includes(searchText) 
	      	;
	    });
   }

}