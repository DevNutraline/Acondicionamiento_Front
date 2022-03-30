import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterRole'
})
export class FilterRolePipe implements PipeTransform {
	
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