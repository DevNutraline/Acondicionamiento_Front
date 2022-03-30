import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterCarpeta'
})
export class FilterCarpetaPipe implements PipeTransform {
	
	transform(items: any[], searchText: string): any[] {
    	if(!items) return [];
	    if(!searchText) return items;
		searchText = searchText.toLowerCase();
		return items.filter( element => {
			let result=null;
			if(element.cod_carpeta)
				result= result || element.cod_carpeta.toLowerCase().includes(searchText)
			if(element.status)
				result= result || element.status.toLowerCase().includes(searchText)
			if(element.type)
				result= result || element.type.toLowerCase().includes(searchText)
		    if(element.closed_at)
				result=result || element.closed_at.toString().toLowerCase().includes(searchText)			
	      	return result;
	   	});
   }

}