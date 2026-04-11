export interface TraderDetailsModel {
  Id: number;
  Name: string;
  PhoneNumber: string;
  NationalID: string;
  Balance: number;
  CreatedAt: Date;
  MoneySentByDate: MoneySentByDateModel[];
}

export interface MoneySentByDateModel {
  Date: Date;
  TotalAmount: number;
  TransactionsByType: TransactionByTypeModel[];
}

export interface TransactionByTypeModel {
  EntityType: number;
  EntityTypeName: string; 
  ReceiverEntityTypeName: string; 
  ReceiverPhoneNumber: string; 
  PhoneNumber: string | null;
  Provider: string | null;
  Amount: number;
  TransactionCount: number;
}
