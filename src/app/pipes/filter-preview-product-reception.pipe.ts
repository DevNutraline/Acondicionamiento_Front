import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterPreviewProductReception'
})
export class FilterPreviewProductReceptionPipe implements PipeTransform {	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.product_received_by_version.product_reception.product.cod_sap.toLowerCase().includes(searchText) ||
	      		element.product_received_by_version.version.name.toLowerCase().includes(searchText) ||
	      		element.status.toLowerCase().includes(searchText);
	    });
   	}
}