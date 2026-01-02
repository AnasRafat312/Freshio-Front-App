import { Pipe, PipeTransform } from '@angular/core';
import { EntityType } from 'src/app/core/enums/entity.enum';
import { SharedService } from 'src/app/shared/services/shared.service';

@Pipe({
  name: 'entityEnumsToString'
})
export class EntityEnumsToStringPipe implements PipeTransform {

  constructor(private sharedService:SharedService){}
  transform(value:any, ...args: unknown[]): any {
    let result = this.sharedService.getKeyNameByValue(EntityType,value)
    return result;
  }

}
