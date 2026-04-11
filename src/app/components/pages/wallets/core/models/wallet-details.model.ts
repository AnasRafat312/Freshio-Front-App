export interface WalletDetailsModel {
  Id: number;
  Name: string;
  PhoneNumber: string;
  NationalId: string;
  Provider: number;
  Balance: number;
  DailyLimit: number;
  MonthlyLimit: number;
  Status: number;
  CreatedAt: Date;
  MoneySentTo: TransactionGroupModel[];
  MoneyReceivedFrom: TransactionGroupModel[];
}

export interface TransactionGroupModel {
  Date: Date;
  TotalAmount: number;
  TransactionsByType: TransactionByTypeModel[];
  CreatedByName: string;
}

export interface TransactionByTypeModel {
  EntityType: number;
  EntityTypeName: string;
  PhoneNumber: string | null;
  Amount: number;
  TransactionCount: number;
  Provider: string;
  CardNumber: string;
}
