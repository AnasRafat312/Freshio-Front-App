export enum WasteType {
    Items = 1,
    Delivery = 2,
    Materials = 3,
    Purchase = 4,
    Carry = 5
}

export enum WasteDetailType {
    Item = 1,
    Material = 2,
    Delivery = 3,
    Purchase = 4,
    Carry = 5
}

export interface WasteOrderModel {
    ID?: number;
    WasteNumber?: string;
    WasteDate: Date;
    TotalWasteAmount?: number;
    EmployeeEntityId?: number;
    EmployeeName?: string;
    Reason?: string;
    Notes?: string;
    Items: WasteOrderItemModel[];
    CreatedDate?: Date;
    ModifiedDate?: Date;
}

export interface WasteOrderItemModel {
    ID?: number;
    WasteOrderId?: number;
    ItemId: number | null;
    ItemName?: string;
    ItemUnitOfMeasure?: string;
    UnitOfMeasure?: string;
    AvailableQuantity?: number;
    Quantity: number;
    WasteType: WasteType;
    WasteTypeName?: string;
    Cost?: number;
}

export interface CreateWasteDto {
    WasteDate: Date | string;
    EmployeeEntityId?: number;
    Reason?: string;
    Notes?: string;
    WasteOrderItems: CreateWasteItemDto[];
}

export interface CreateWasteItemDto {
    ItemId: number | null;
    Quantity: number;
    WasteType: WasteType;
    Cost?: number;
}

export interface WasteDetailRow {
    detailType: WasteDetailType;
    referenceId: number | null;
    referenceName?: string;
    deliveryReference?: string;
    unitOfMeasure?: string;
    availableQuantity?: number;
    quantity: number | null;
    wasteAmount: number | null;
    unitCost: number | null;
    total: number;
}

export interface WasteOrderDto {
    ID: number;
    WasteNumber: string;
    WasteDate: Date;
    EmployeeEntityId?: number;
    EmployeeName?: string;
    Reason?: string;
    Notes?: string;
    Items: WasteOrderItemDto[];
}

export interface WasteOrderItemDto {
    ID: number;
    ItemId: number;
    ItemName: string;
    UnitOfMeasure: string;
    Quantity: number;
    WasteType: WasteType;
}
