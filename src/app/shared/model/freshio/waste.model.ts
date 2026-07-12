export interface WasteOrderModel {
    ID?: number;
    WasteNumber?: string;
    WasteDate: Date;
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
    ItemId: number;
    ItemName?: string;
    UnitOfMeasure?: string;
    AvailableQuantity?: number;
    Quantity: number;
}

export interface CreateWasteDto {
    WasteDate: Date;
    EmployeeEntityId?: number;
    Reason?: string;
    Notes?: string;
    WasteOrderItems: CreateWasteItemDto[];
}

export interface CreateWasteItemDto {
    ItemId: number;
    Quantity: number;
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
}
