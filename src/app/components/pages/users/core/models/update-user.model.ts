export interface UpdateUserModel {
  Username: string;
  Email: string;
  FullName?: string;
  PhoneNumber?: string;
  RoleId: number;
  CompanyId?: number;
  BranchId?: number;
  IsActive: boolean;
}
