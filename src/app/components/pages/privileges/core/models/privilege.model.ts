import { BaseEntityModel } from 'src/app/core/common/basic.model';

export interface PrivilegeModel extends BaseEntityModel {
  Name: string;
  Description?: string;
}
