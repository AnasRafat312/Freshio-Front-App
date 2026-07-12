export interface PrivilegeTree {
    children: PrivilegeTree[];
    ID: number;
    Type: string;
    Value: string;
    IsLeaf: boolean;
    ClaimType: number;
    ParentID: number | null;
    ModuleID: number | null;
    actualClaimList?: null;
    actualClaimObject?: null;
    isChecked: boolean;
    roleClaims?: [];
    roleID?: number;
    userClaims?: [];
}
export interface FertualTree {
    name: string;
    id: number;
    isChecked: boolean;
    isPlanType: boolean;
    claimId: number;
    isLeaf: boolean;
    children?: FertualTree[];
  }
export interface PrivilegeRoles {
    ID: number;
    Name: string;
    CompanyID: number;
}
export interface PrivilegeChecked {
    page?:string,
    actions?:string[]
}