export interface StockShortageReportDto {
    Items: StockShortageReportItemDto[];
    FromDate?: Date;
    ToDate?: Date;
}

export interface StockShortageReportItemDto {
    ItemId: number;
    ItemName: string;
    ItemNameAr?: string;
    UnitOfMeasure: string;
    UnitOfMeasureAr?: string;
    RequiredQuantity: number;
    AvailableQuantity: number;
    MissingQuantity: number;
    AveragePurchasePrice: number;
    EstimatedPurchaseCost: number;
}

export interface StockShortageReportFilterDto {
    FromDate?: Date;
    ToDate?: Date;
    CustomerEntityId?: number;
    ItemId?: number;
}

export interface DashboardStatsDto {
    PendingOrdersCount: number;
    ApprovedOrdersToday: number;
    TotalSalesToday: number;
    TotalProfitToday: number;
    LowStockItemsCount: number;
    ShortageItemsCount: number;
    WasteToday: number;
    PurchasesToday: number;
}

export interface TopSellingItemDto {
    ItemId: number;
    ItemName: string;
    ItemNameAr?: string;
    TotalQuantitySold: number;
    TotalRevenue: number;
}

export interface LatestOrderDto {
    OrderId: number;
    OrderNumber: string;
    OrderDate: Date;
    CustomerName: string;
    Status: number;
    TotalAmount: number;
}
