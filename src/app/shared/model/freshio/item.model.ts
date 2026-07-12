export interface ItemModel {
    ID?: number;
    Name: string;
    NameAr?: string;
    UnitOfMeasure: string;
    UnitOfMeasureAr?: string;
    DefaultSellPrice: number;
    AveragePurchasePrice?: number;
    MinimumStockQuantity: number;
    IsActive: boolean;
    CreatedDate?: Date;
    ModifiedDate?: Date;
}

export interface ItemDto {
    ID?: number;
    Name: string;
    NameAr?: string;
    UnitOfMeasure: string;
    UnitOfMeasureAr?: string;
    DefaultSellPrice: number;
    AveragePurchasePrice?: number;
    MinimumStockQuantity: number;
    IsActive: boolean;
}
