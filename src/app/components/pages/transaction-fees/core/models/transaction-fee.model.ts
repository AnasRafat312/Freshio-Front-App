import { BaseEntityModel } from "src/app/core/common/basic.model";
import { FeeTypeEnum } from "../enums/fee-type.enum";

export interface TransactionFeeModel extends BaseEntityModel {
  Name: string;
  Description: string;
  FeeType: FeeTypeEnum;
  Value: number;
  IsActive: boolean;
}
