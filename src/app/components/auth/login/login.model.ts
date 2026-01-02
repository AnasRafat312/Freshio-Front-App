export interface ILogin {
    Email:string;
    Password:string;
}

export interface IUserRole {
    roleId:number;
    userId:number;
}

export interface RegistrationModel {
    Email :string,
    Password :string,
    Address :string,
    UserName :string,
    CompanyName :string,
    Phone :string,
    IndustryID :number,
    CountryID :number,
    SelectedPlanID:number,
    CreatedDateTime:string | Date
}
