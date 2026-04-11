import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms"

export interface Entity {
    Code: string,
    ArabicName: string,
    EnglishName: string,
    LegalName: string,
    NationalityID: number,
    EntityType: number,
    IsMyEntity: boolean,
    CompanyID: number,
    StartDate: Date | string,
    taxRegNo: number,
    taxCardStartDate: Date | string,
    taxCardEndDate: Date | string,
    commercialNo: number,
    lootcomDate: Date | string,
    birthDate: Date | string,
    moritalStatus: number,
    NationalId: number,
    passportNo: number,
    gender: number,
    webDataType: number,
    companyContacts?: number,
    personContacts?: number,
    roleClassification?: number,
    RoleInCompany: string,
    country: number,
    city: number,
    street: string,
    emails: EntityWebData[],
    phones: EntityTelephone[],
    EntityAddressList: EntityAddress[],

}
export interface EntityWebData {
    WebAddress: string,
    Addresstype: number
}
export interface EntityContact {
    RoleClassificationID: number,
    RoleInCompany: string,
}
export interface EntityTelephone {
    Telephone: number
}
export interface EntityAddress {
    Streetline: string
    EntityUserID?: number
    CityID: number
    LocationID: number,
    CountryName: number,
    CityName: number,
}
export interface DeleteEntity {
    ID :number
    DeletedBy:number
    DeletedDateTime: Date | string
    companyId: number
    EntityType: number | string
}



