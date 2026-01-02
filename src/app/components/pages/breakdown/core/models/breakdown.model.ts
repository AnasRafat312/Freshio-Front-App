import { BaseEntityModel } from 'src/app/core/common/basic.model';
import { BreakdownTypeEnum } from '../enums/breakdown-type.enum';

export interface BreakdownItemModel {
  Name: string;
  Amount: number;
  Date: Date | string;
  Description: string;
}

export interface BreakdownModel extends BaseEntityModel {
  Type: BreakdownTypeEnum;
  Name: string;
  BreakdownItems: BreakdownItemModel[];
}
