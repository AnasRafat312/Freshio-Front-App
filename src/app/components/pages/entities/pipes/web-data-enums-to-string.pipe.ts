import { Pipe, PipeTransform } from '@angular/core';
import { WebData } from 'src/app/core/enums/entity.enum';
import { SharedService } from 'src/app/shared/services/shared.service';

@Pipe({
  name: 'webDataEnumsToString'
})
export class WebDataEnumsToStringPipe implements PipeTransform {

  constructor(private sharedService:SharedService){}
  transform(value:any, ...args: unknown[]): any {
    let result = this.sharedService.getKeyNameByValue(WebData,value)
    return result;
  }

}
