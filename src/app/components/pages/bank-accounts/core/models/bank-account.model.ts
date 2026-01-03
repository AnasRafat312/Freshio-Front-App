import { BaseEntityModel } from 'src/app/core/common/basic.model';

export interface BankAccountModel extends BaseEntityModel {
  AccountHolderName: string;
  PhoneNumber: number;
  Balance: number;
  BankName: string;
  AccountNumber: number;
  IBAN: number;
}
