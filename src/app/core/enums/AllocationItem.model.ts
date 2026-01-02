export interface AllocationItemModel {
    ProjectID: number,
    CostCenterID: number,
    Amount: number,
    ContractID?: number,
    InvoiceID?: number,
    InvoicesList?: any[],
    outgoing?: any,
    ContractsList?: any[],
    AssetsID?: number,
    CompanyID: number,
    CreatedBy: number,
    CreatedDateTime: Date | string
}

