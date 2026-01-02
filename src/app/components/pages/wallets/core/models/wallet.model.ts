import { BaseEntityModel } from 'src/app/core/common/basic.model';
import { WalletStatusEnum, WalletTypeEnum } from '../enums/wallet-status.enum';

export interface WalletModel extends BaseEntityModel {
  PhoneNumber: number;
  Name: string;
  MonthlyLimit: number;
  DailyLimit: number;
  Balance: number;
  Status: WalletStatusEnum;
  Type: WalletTypeEnum;
  NationalID: number;
}
