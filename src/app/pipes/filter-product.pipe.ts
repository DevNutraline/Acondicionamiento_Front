import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterProduct'
})
export class FilterProductPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
			let result=element.cod_sap.toLowerCase().includes(searchText) || 
	      		element.descriptions.toLowerCase().includes(searchText) || 
	      		element.codgf.toLowerCase().includes(searchText) ||
	      		element.product_brand.name.toLowerCase().includes(searchText)
		    if(element.factura && element.factura.folioNum){
				result=result || element.factura.folioNum.toString().toLowerCase().includes(searchText)
			}
			if(element.ova_product_type && element.ova_product_type.name){
				result=result || element.ova_product_type.name.toLowerCase().includes(searchText)
			}
			if(element.ova_process_type && element.ova_process_type.name){
				result=result || element.ova_process_type.name.toLowerCase().includes(searchText)
			}
			if(element.lot && element.lot.name){
				result=result || element.lot.name.toLowerCase().includes(searchText)
			}
	      	return result;
	    });
   }

}