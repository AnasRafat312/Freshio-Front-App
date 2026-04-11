import { BaseEntityModel } from 'src/app/core/common/basic.model';
import { YellowCardStatusEnum } from '../enums/yellow-card-status.enum';

export interface YellowCardModel extends BaseEntityModel {
  Name: string;
  PhoneNumber: number;
  MonthlyLimit: number;
  DailyLimit: number;
  Balance: number;
  Status: YellowCardStatusEnum;
  NationalID: number;
}
