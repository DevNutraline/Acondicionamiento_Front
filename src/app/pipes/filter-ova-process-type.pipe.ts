import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterOVAProcessType'
})
export class FilterOVAProcessTypePipe implements PipeTransform {	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.operation_type.toLowerCase().includes(searchText) || 
	      		element.descriptions.toLowerCase().includes(searchText) || 
	      		element.activity_code.toLowerCase().includes(searchText)
	      	;
	    });
   	}
}