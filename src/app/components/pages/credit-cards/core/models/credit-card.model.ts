import { BaseEntityModel } from 'src/app/core/common/basic.model';
import { CreditCardStatusEnum } from '../enums/credit-card-status.enum';

export interface CreditCardModel extends BaseEntityModel {
  Name: string;
  PhoneNumber: number;
  Limit: number;
  InitialBalance: number;
  CurrentBalance: number;
  Status: CreditCardStatusEnum;
  NationalID: number;
}
