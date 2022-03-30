
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterLot'
})
export class FilterLotPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
		if(!items) return [];
		if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
			let result=element.name.toString().toLowerCase().includes(searchText)
			if(element.product && element.product.cod_sap){
				result=result || element.product.cod_sap.toLowerCase().includes(searchText)
			}
			if(element.product && element.product.descriptions){
				result=result || element.product.descriptions.toString().toLowerCase().includes(searchText)
			}
		  	return result;
		});
   }

}