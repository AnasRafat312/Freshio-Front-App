import { BaseEntityModel } from 'src/app/core/common/basic.model';

export interface UserDetailsModel extends BaseEntityModel {
  Username: string;
  Email: string;
  FullName?: string;
  PhoneNumber?: string;
  ImagePath?: string;
  RoleId: number;
  RoleName: string;
  IsActive: boolean;
  LastLoginAt?: Date;
  UpdatedAt?: Date;
}
