export interface EntityModel {
    ID?: number;
    Name: string;
    NameAr?: string;
    WhatsAppNumber?: string;
    AdditionalPhone?: string;
    Address?: string;
    AddressAr?: string;
    GoogleMapUrl?: string;
    Latitude?: number;
    Longitude?: number;
    IsCustomer: boolean;
    IsSupplier: boolean;
    IsEmployee: boolean;
    IsDriver: boolean;
    Notes?: string;
    IsActive: boolean;
    CreatedDate?: Date;
    ModifiedDate?: Date;
}

export enum EntityRole {
    Customer = 1,
    Supplier = 2,
    Employee = 3,
    Driver = 4
}

export interface EntityDto {
    ID?: number;
    Name: string;
    NameAr?: string;
    WhatsAppNumber?: string;
    AdditionalPhone?: string;
    Address?: string;
    AddressAr?: string;
    GoogleMapUrl?: string;
    Latitude?: number;
    Longitude?: number;
    IsCustomer: boolean;
    IsSupplier: boolean;
    IsEmployee: boolean;
    IsDriver: boolean;
    Notes?: string;
    IsActive: boolean;
}

export interface CreateEntityDto {
    Name: string;
    NameAr?: string;
    WhatsAppNumber?: string;
    AdditionalPhone?: string;
    Address?: string;
    AddressAr?: string;
    GoogleMapUrl?: string;
    Latitude?: number;
    Longitude?: number;
    IsCustomer?: boolean;
    IsSupplier?: boolean;
    IsEmployee?: boolean;
    IsDriver?: boolean;
    Notes?: string;
    IsActive: boolean;
}

export interface CustomerReportRequestDto {
    fromDate?: string | Date;
    toDate?: string | Date;
}

export interface CustomerReportDto {
    entityId: number;
    name: string;
    ordersCount: number;
    averageOrderPrice: number;
    lastOrderDate: Date | string;
    whatsappPhoneNumber: string;
}
