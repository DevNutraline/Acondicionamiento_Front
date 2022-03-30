import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterProductVersion'
})
export class FilterProductVersionPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
			let result=element.name.toLowerCase().includes(searchText)
		    if(element.product && (element.product.descriptions || element.product.cod_sap)){
				result=result || element.product.descriptions.toLowerCase().includes(searchText) 
				|| element.product.cod_sap.toString().toLowerCase().includes(searchText)
			}
	      	return result;
	    });
   }

}