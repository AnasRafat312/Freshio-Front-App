export interface BoxItemDto {
  Id: number;
  Amount: number;
  Date: Date | string;
  Description?: string;
  IsDeleted: boolean;
}

export interface CreateBoxItemDto {
  BoxId: number;
  Amount: number;
  Date: Date | string;
  Description?: string;
}

export interface UpdateBoxItemDto {
  Amount: number;
  Date: Date | string;
  Description?: string;
}

export interface BoxItemResponseDto {
  Id: number;
  BoxId: number;
  BoxName: string;
  Amount: number;
  Date: Date | string;
  Description?: string;
  CreatedAt: Date | string;
  UpdatedAt?: Date | string;
}

export interface CreateBoxDto {
  Name: string;
  Type: string; // "In" or "Out"
  BoxItemsList: BoxItemDto[];
}

export interface UpdateBoxDto {
  Name: string;
  Type: string; // "In" or "Out"
  BoxItemsList: BoxItemDto[];
}

export interface BoxResponseDto {
  Id: number;
  Name: string;
  Type: string;
  TotalAmount: number;
  ItemCount: number;
  CreatedAt: Date | string;
  UpdatedAt?: Date | string;
}

export interface BoxDetailsDto {
  Id: number;
  Name: string;
  Type: string;
  TotalAmount: number;
  Items: BoxItemResponseDto[];
  CreatedAt: Date | string;
  UpdatedAt?: Date | string;
}

export interface BreakdownDashboardDto {
  InBoxes: BoxResponseDto[];
  OutBoxes: BoxResponseDto[];
  TotalIn: number;
  TotalOut: number;
  NetBalance: number;
}
