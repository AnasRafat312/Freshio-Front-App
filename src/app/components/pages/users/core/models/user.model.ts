import { BaseEntityModel } from 'src/app/core/common/basic.model';

export interface UserModel extends BaseEntityModel {
  Username: string;
  Email: string;
  FullName?: string;
  PhoneNumber?: string;
  ImagePath?: string;
  RoleName: string;
  CompanyId: number;
  CompanyName?: string;
  BranchId?: number;
  BranchName?: string;
  IsActive: boolean;
}
