export interface BaseEntityModel{
    ID:number;
    IsDeleted:Boolean;
    CreatedBy:number;
    CreatedDateTime: Date;
    DeletedBy?: number;
    DeletedDateTime?:Date;
    CompanyID?: number;
}
