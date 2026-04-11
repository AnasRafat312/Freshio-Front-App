export interface CreditCardDetailsModel {
  Id: number;
  CardNumber: string;
  CardHolderName: string;
  Balance: number;
  CreditLimit: number;
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
}
