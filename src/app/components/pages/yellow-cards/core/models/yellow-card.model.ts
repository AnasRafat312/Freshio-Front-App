import { BaseEntityModel } from 'src/app/core/common/basic.model';
import { YellowCardStatusEnum } from '../enums/yellow-card-status.enum';

export interface YellowCardModel extends BaseEntityModel {
  CaredHolderName: string;//
  CardNumber: number;//
  PhoneNumber: string;//
  ExpiryDate: Date | string;//
  MonthlyLimit: number;
  DailyLimit: number;
  Balance: number;
  Status: YellowCardStatusEnum;
  NationalId: number;
  MonthlyUsed?: number;//
  DailyUsed?: number;//
  Notes: string;//
}
