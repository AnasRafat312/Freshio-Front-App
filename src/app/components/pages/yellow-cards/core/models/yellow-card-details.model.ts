export interface YellowCardDetailsModel {
  Id: number;
  CardNumber: string;
  CardHolderName: string;
  NationalId: string;
  PhoneNumber: string;
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
  CardNumber: string | null;
  Provider: string | null;
  Amount: number;
  TransactionCount: number;
}
