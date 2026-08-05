export interface SalesOrderModel {
    ID?: number;
    OrderNumber?: string;
    OrderDate: Date;
    CustomerEntityId: number;
    CustomerName?: string;
    Status: OrderStatus;
    TotalAmount: number;
    DeliveryFees?: number;
    TotalCost?: number;
    TotalProfit?: number;
    Notes?: string;
    RejectionReason?: string;
    Items: SalesOrderItemModel[];
    SalesOrderItems?: SalesOrderItemModel[];
    CreatedDate?: Date;
    ModifiedDate?: Date;
}

export interface SalesOrderItemModel {
    ID?: number;
    SalesOrderId?: number;
    ItemId: number;
    ItemName?: string;
    UnitOfMeasure?: string;
    RequestedQuantity: number;
    ApprovedQuantity?: number;
    AvailableQuantity?: number;
    UnitPrice: number;
    UnitCost?: number;
    LineTotal: number;
    TotalCost?: number;
    Profit?: number;
    Notes?: string;
}

export enum OrderStatus {
    Pending = 1,
    Approved = 2,
    PartiallyApproved = 3,
    Rejected = 4,
    Delivered = 5
}

export interface CreateSalesOrderDto {
    OrderNumber?: string;
    OrderDate: Date | string;
    CustomerEntityId: number;
    DeliveryFees?: number;
    Notes?: string;
    ID?: number;
    SalesOrderItems: CreateSalesOrderItemDto[];
}

export interface CreateSalesOrderItemDto {
    ItemId: number;
    ID?: number;
    RequestedQuantity: number;
    UnitPrice: number;
    Notes?: string;
    IsDeleted?: boolean;
}

export interface SalesOrderDto {
    ID: number;
    OrderNumber: string;
    OrderDate: Date;
    CustomerEntityId: number;
    CustomerName: string;
    Status: OrderStatus;
    TotalAmount: number;
    DeliveryFees?: number;
    TotalCost?: number;
    TotalProfit?: number;
    Notes?: string;
    RejectionReason?: string;
    Items: SalesOrderItemDto[];
}

export interface SalesOrderItemDto {
    ID: number;
    ItemId: number;
    ItemName: string;
    UnitOfMeasure: string;
    RequestedQuantity: number;
    ApprovedQuantity?: number;
    AvailableQuantity?: number;
    UnitPrice: number;
    UnitCost?: number;
    LineTotal: number;
    TotalCost?: number;
    Profit?: number;
    Notes?: string;
}

export interface ApproveOrderResultDto {
    Success: boolean;
    Message?: string;
    Shortages?: StockShortageItemDto[];
}

export interface StockShortageItemDto {
    ItemId: number;
    ItemName: string;
    UnitOfMeasure: string;
    RequestedQuantity: number;
    AvailableQuantity: number;
    MissingQuantity: number;
}

export interface PartialApproveOrderDto {
    SalesOrderItems: PartialApproveItemDto[];
}

export interface PartialApproveItemDto {
    OrderItemId: number;
    ApprovedQuantity: number;
}

export interface RejectOrderDto {
    RejectionReason: string;
}

export interface OrderItemsByDateDto {
    ItemId: number;
    ItemName: string;
    ItemUnitOfMeasure: string;
    TotalRequestedQuantity: number;
    TotalApprovedQuantity: number;
}
