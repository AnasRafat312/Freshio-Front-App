import { BaseEntityModel } from 'src/app/core/common/basic.model';
import { CreditCardStatusEnum } from '../enums/credit-card-status.enum';

export interface CreditCardModel extends BaseEntityModel {
  CardHolderName: string;//
  CardNumber: number;//
  Limit: number;
  Balance: number;//
  Status: CreditCardStatusEnum;
  ExpiryDate: Date | string;//
  Notes: string;//
  NationalId: number;
  Indebtedness?: number;
  PaymentDueDayOfMonth?: number;
}
