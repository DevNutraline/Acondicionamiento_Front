import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterFactura'
})
export class FilterFacturaPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
	      	return element.folioNum.toString().toLowerCase().includes(searchText)||
	      	element.id_clone.toString().toLowerCase().includes(searchText)||
	      	element.docDate.toString().toLowerCase().includes(searchText)||
	      	element.docDueDate.toString().toLowerCase().includes(searchText)||
	      	element.cardCode.toLowerCase().includes(searchText)||
	      	element.cardName.toLowerCase().includes(searchText);
	    });
   }

}