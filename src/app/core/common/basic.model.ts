export interface BaseEntityModel{
    Id:number;
    IsDeleted:Boolean;
    CreatedBy:number;
    CreatedDateTime: Date;
    DeletedBy?: number;
    DeletedDateTime?:Date;
    CompanyID?: number;
}
