import { FawryMachineModel } from './fawry-machine.model';

export interface FawryMachineDetailsModel extends FawryMachineModel {
  CreatedAt?: Date;
  UpdatedAt?: Date;
}
