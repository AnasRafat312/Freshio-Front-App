export interface InvoiceModel {
    OrderId: number;
    OrderNumber: string;
    OrderDate: Date;
    CompanyName?: string;
    CompanyLogo?: string;
    CompanyAddress?: string;
    CompanyPhone?: string;
    CustomerName: string;
    CustomerPhone?: string;
    CustomerAddress?: string;
    Items: InvoiceItemModel[];
    TotalAmount: number;
    Notes?: string;
}

export interface InvoiceItemModel {
    ItemName: string;
    ItemNameAr?: string;
    UnitOfMeasure: string;
    Quantity: number;
    UnitPrice: number;
    Total: number;
}

export interface InvoiceDto {
    OrderId: number;
    OrderNumber: string;
    OrderDate: Date;
    CompanyName?: string;
    CompanyLogo?: string;
    CompanyAddress?: string;
    CompanyPhone?: string;
    CustomerName: string;
    CustomerPhone?: string;
    CustomerAddress?: string;
    Items: InvoiceItemDto[];
    TotalAmount: number;
    Notes?: string;
}

export interface InvoiceItemDto {
    ItemName: string;
    ItemNameAr?: string;
    UnitOfMeasure: string;
    Quantity: number;
    UnitPrice: number;
    Total: number;
}
