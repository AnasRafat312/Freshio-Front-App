export interface BankAccountDetailsModel {
  Id: number;
  BankName: string;
  AccountNumber: string;
  AccountHolderName: string;
  IBAN: string | null;
  Balance: number;
  PhoneNumber: string | null;
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
