import { BaseEntityModel } from 'src/app/core/common/basic.model';
import { YellowCardStatusEnum } from '../enums/yellow-card-status.enum';

export interface YellowCardModel extends BaseEntityModel {
  CaredHolderName: string;//
  CardNumber: number;//
  ExpiryDate: Date | string;//
  MonthlyLimit: number;
  DailyLimit: number;
  Balance: number;
  Status: YellowCardStatusEnum;
  NationalID: number;
  MonthlyUsed?: number;//
  DailyUsed?: number;//
  Notes: string;//
}
