export interface DeliveryRouteModel {
    ID?: number;
    RouteDate: Date;
    DriverEntityId: number;
    DriverName?: string;
    StartLocationLat?: number;
    StartLocationLng?: number;
    StartLocationAddress?: string;
    TotalDistance?: number;
    TotalDuration?: number;
    Status?: RouteStatus;
    Stops: DeliveryStopModel[];
    CreatedDate?: Date;
    ModifiedDate?: Date;
}

export interface DeliveryStopModel {
    ID?: number;
    DeliveryRouteId?: number;
    SalesOrderId: number;
    OrderNumber?: string;
    CustomerName?: string;
    CustomerPhone?: string;
    Address?: string;
    GoogleMapUrl?: string;
    Latitude?: number;
    Longitude?: number;
    StopOrder: number;
    Distance?: number;
    Duration?: number;
    IsDelivered?: boolean;
}

export enum RouteStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2
}

export interface CreateDeliveryRouteDto {
    RouteDate: Date;
    DriverEntityId: number;
    StartLocationLat?: number;
    StartLocationLng?: number;
    StartLocationAddress?: string;
    OrderIds: number[];
}

export interface DeliveryRouteDto {
    ID: number;
    RouteDate: Date;
    DriverEntityId: number;
    DriverName: string;
    StartLocationAddress?: string;
    TotalDistance?: number;
    TotalDuration?: number;
    Status: RouteStatus;
    Stops: DeliveryStopDto[];
}

export interface DeliveryStopDto {
    ID: number;
    SalesOrderId: number;
    OrderNumber: string;
    CustomerName: string;
    CustomerPhone?: string;
    Address?: string;
    GoogleMapUrl?: string;
    StopOrder: number;
    Distance?: number;
    Duration?: number;
    IsDelivered: boolean;
}
