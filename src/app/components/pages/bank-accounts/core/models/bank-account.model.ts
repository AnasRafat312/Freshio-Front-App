import { BaseEntityModel } from 'src/app/core/common/basic.model';

export interface BankAccountModel extends BaseEntityModel {
  Name: string;
  PhoneNumber: number;
  CurrentBalance: number;
  InitialBalance: number;
}
