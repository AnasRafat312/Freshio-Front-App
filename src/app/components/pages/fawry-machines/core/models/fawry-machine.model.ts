import { BaseEntityModel } from 'src/app/core/common/basic.model';
import { FawryMachineStatusEnum } from '../enums/fawry-machine-status.enum';

export interface FawryMachineModel extends BaseEntityModel {
  SerialNumber: string;
  PhoneNumber: string;
  Balance: number;
  DailyLimit: number;
  MonthlyLimit: number;
  Status: FawryMachineStatusEnum;
  Notes?: string;
  DailyUsed?: number;
  MonthlyUsed?: number;
}
