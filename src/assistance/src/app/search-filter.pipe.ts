import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
 name: 'searchfilter'
})

@Injectable()
export class SearchFilterPipe implements PipeTransform {
 transform(items: any[], field: string, value: string): any[] {
   if (value == "") {
     return items;
   }
   if (!items) return [];
   return items.filter(it => it[field].toLowerCase().search(value.toLowerCase()) > -1 );
 }
}
