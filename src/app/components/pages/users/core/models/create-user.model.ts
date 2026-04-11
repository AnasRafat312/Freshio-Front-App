export interface CreateUserModel {
  Username: string;
  Password: string;
  PasswordConfirmation: string;
  Email: string;
  FullName?: string;
  PhoneNumber?: string;
  RoleId: number;
  CompanyId?: number;
  BranchId?: number;
}
