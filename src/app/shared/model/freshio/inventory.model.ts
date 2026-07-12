export interface InventoryModel {
    ItemId: number;
    ItemName: string;
    ItemNameAr?: string;
    UnitOfMeasure: string;
    UnitOfMeasureAr?: string;
    AvailableQuantity: number;
    AveragePurchasePrice: number;
    TotalCost?: number;
    MinimumStockQuantity: number;
    StockStatus: StockStatus;
}

export enum StockStatus {
    Normal = 0,
    LowStock = 1,
    OutOfStock = 2
}

export interface InventoryDto {
    ItemId: number;
    ItemName: string;
    ItemNameAr?: string;
    UnitOfMeasure: string;
    UnitOfMeasureAr?: string;
    AvailableQuantity: number;
    AveragePurchasePrice: number;
    TotalCost?: number;
    MinimumStockQuantity: number;
    StockStatus: StockStatus;
}
