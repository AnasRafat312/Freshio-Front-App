export interface PurchaseOrderModel {
    ID?: number;
    PurchaseNumber?: string;
    PurchaseDate: Date;
    SupplierEntityId?: number;
    SupplierName?: string;
    ExternalSupplierName?: string;
    EmployeeEntityId?: number;
    EmployeeName?: string;
    TotalAmount: number;
    Notes?: string;
    Items: PurchaseOrderItemModel[];
    CreatedDate?: Date;
    ModifiedDate?: Date;
}

export interface PurchaseOrderItemModel {
    ID?: number;
    PurchaseOrderId?: number;
    ItemId: number;
    ItemName?: string;
    UnitOfMeasure?: string;
    Quantity: number;
    UnitPrice: number;
    TotalPrice: number;
}

export interface CreatePurchaseDto {
    PurchaseDate: Date;
    ID?: number;
    SupplierEntityId?: number;
    ExternalSupplierName?: string;
    EmployeeEntityId?: number;
    Notes?: string;
    PurchaseOrderItems: CreatePurchaseItemDto[];
}

export interface CreatePurchaseItemDto {
    ID?: number;
    ItemId: number;
    Quantity: number;
    UnitPrice: number;
    IsDeleted?: boolean;
}

export interface PurchaseOrderDto {
    ID: number;
    PurchaseNumber: string;
    PurchaseDate: Date;
    SupplierEntityId?: number;
    SupplierName?: string;
    ExternalSupplierName?: string;
    EmployeeEntityId?: number;
    EmployeeName?: string;
    TotalAmount: number;
    Notes?: string;
    Items: PurchaseOrderItemDto[];
}

export interface PurchaseOrderItemDto {
    ID: number;
    ItemId: number;
    ItemName: string;
    UnitOfMeasure: string;
    Quantity: number;
    UnitPrice: number;
    TotalPrice: number;
}
