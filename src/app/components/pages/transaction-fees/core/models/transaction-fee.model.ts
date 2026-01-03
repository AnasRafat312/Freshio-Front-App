import { BaseEntityModel } from "src/app/core/common/basic.model";
import { FeeTypeEnum } from "../enums/fee-type.enum";

export interface TransactionFeeModel extends BaseEntityModel {
  Amount: number;
  Type: FeeTypeEnum;
}
