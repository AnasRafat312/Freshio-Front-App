export interface ResponseModel {
    //massageType: number,
    Errors: string[],
    Message: string,
    Success: boolean,
    Data: any,
    Shortages?: Array<{
        OrderItemId: number,
        ItemId: number,
        ItemName: string,
        RequestedQuantity: number,
        AvailableQuantity: number,
        MissingQuantity: number
    }>
}
