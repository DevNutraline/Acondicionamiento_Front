import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterDirectriz'
})
export class FilterDirectrizPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.detalle.toLowerCase().includes(searchText) || 
	      		element.image.toLowerCase().includes(searchText)|| 
	      		element.insumo.descriptions.toLowerCase().includes(searchText)|| 
	      		element.version_product.name.toLowerCase().includes(searchText)
	      	;
	    });
   }

}