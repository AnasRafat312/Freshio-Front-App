import { BaseEntityModel } from 'src/app/core/common/basic.model';
import { WalletProviderEnum, WalletStatusEnum } from '../enums/wallet-status.enum';

export interface WalletModel extends BaseEntityModel {
  PhoneNumber: number;
  Name: string;
  MonthlyLimit: number;
  DailyLimit: number;
  Balance: number;
  Status: WalletStatusEnum;
  NationalID: number;
  Provider: WalletProviderEnum;//
  MonthlyUsed?: number;//
  DailyUsed?: number;//
  Notes: string;//
}
