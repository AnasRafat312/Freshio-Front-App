import { BaseEntityModel } from "src/app/core/common/basic.model";
import { AdjustmentType } from "../enums/adjustment-type.enum";
import { AdjustmentDirection } from "../enums/adjustment-direction.enum";
import { AdjustmentAppliesTo } from "../enums/adjustment-applies-to.enum";
import { CalculationType } from "../enums/calculation-type.enum";

export interface AdjustmentModel extends BaseEntityModel {
  Name: string;
  AdjustmentType: AdjustmentType;
  Direction: AdjustmentDirection;
  CalculationType: CalculationType;
  Value: number;
  AppliesTo: AdjustmentAppliesTo;
  IsActive: boolean;
  Description?: string;
}
