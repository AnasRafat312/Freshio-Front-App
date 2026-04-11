import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { TransactionsStore } from '../store/transactions.store';
import { 
  TransactionModel, 
  TransactionCreateRequest, 
  TransactionPreviewRequest, 
  TransactionPreviewResponse,
  AccountSelectionModel,
  EntitySelectionModel,
  TransactionFilterModel,
  TransactionAttachmentUpload
} from '../core/models/transaction.model';
import { AccountTypeEnum } from '../core/enums/account-type.enum';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(
    private http: HttpClient,
    private constant: Constant,
    private transactionsStore: TransactionsStore
  ) { }

  /**
   * Get all transactions from API and update store
   * Subscription is handled internally
   */
  getTransactions(filters?: TransactionFilterModel): void {
    const url = `${this.constant.API_ENDPOINT}Transactions/GetAll`;
    
    // If filters provided, use POST with filter object, otherwise GET
    const request$ = filters 
      ? this.http.post<ResponseModel>(url, filters)
      : this.http.get<ResponseModel>(url);

    request$.subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.transactionsStore.setTransactions(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

  /**
   * Get transaction by ID
   */
  getTransactionById(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Transactions/GetById/${id}`;
    return this.http.get<ResponseModel>(url);
  }

  /**
   * Create new transaction
   */
  createTransaction(transaction: TransactionCreateRequest): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Transactions/Create`;
    return this.http.post<ResponseModel>(url, transaction);
  }

  /**
   * Cancel transaction
   */
  cancelTransaction(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Transactions/Cancel/${id}`;
    return this.http.put<ResponseModel>(url, {});
  }

  /**
   * Calculate transaction preview with adjustments
   * This is the key method that gets preview from backend
   */
  calculateTransactionPreview(request: TransactionPreviewRequest): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Adjustments/Calculate`;
    return this.http.post<ResponseModel>(url, request).pipe(
      tap((res: ResponseModel) => {
        if (res?.Success && res?.Data) {
          this.transactionsStore.setTransactionPreview(res.Data);
        }
      })
    );
  }

  /**
   * Get accounts by type
   * Dynamically fetches accounts based on selected AccountType
   */
  getAccountsByType(accountType: AccountTypeEnum): Observable<ResponseModel> {
    let endpoint = '';
    
    switch (accountType) {
      case AccountTypeEnum.Wallet:
        endpoint = 'ElectronicWallets/GetAll';
        break;
      case AccountTypeEnum.BankAccount:
        endpoint = 'BankAccounts/GetAll';
        break;
      case AccountTypeEnum.YellowCard:
        endpoint = 'YellowCards/GetAll';
        break;
      case AccountTypeEnum.CreditCard:
        endpoint = 'CreditCards/GetAll';
        break;
      case AccountTypeEnum.Trader:
        endpoint = 'Traders/GetAll';
        break;
      case AccountTypeEnum.FawryMachine:
        endpoint = 'FawryMachines/GetAll';
        break;
      default:
        throw new Error(`Unsupported account type: ${accountType}`);
    }

    const url = `${this.constant.API_ENDPOINT}${endpoint}`;
    return this.http.get<ResponseModel>(url);
  }

  /**
   * Transform raw account data to AccountSelectionModel
   * Maps different account types to a common selection format
   * @deprecated Use transformToEntitySelection instead
   */
  transformToAccountSelection(accountType: AccountTypeEnum, data: any[]): AccountSelectionModel[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map(item => {
      let displayName = '';
      let reference = '';
      let balance: number | undefined;

      switch (accountType) {
        case AccountTypeEnum.Wallet:
          displayName = `${item.Name} - ${item.PhoneNumber} (${this.getProviderName(item.Provider)})`;
          reference = item.PhoneNumber?.toString();
          balance = item.Balance;
          break;

        case AccountTypeEnum.BankAccount:
          displayName = `${item.AccountHolderName} - ${item.BankName} (${item.AccountNumber})`;
          reference = item.AccountNumber?.toString();
          balance = item.Balance;
          break;

        case AccountTypeEnum.YellowCard:
          displayName = `${item.CaredHolderName} - ${item.CardNumber}`;
          reference = item.CardNumber?.toString();
          balance = item.Balance;
          break;

        case AccountTypeEnum.CreditCard:
          displayName = `${item.CardHolderName} - ${item.CardNumber}`;
          reference = item.CardNumber?.toString();
          balance = item.Balance;
          break;

        case AccountTypeEnum.Trader:
          displayName = `${item.Name} - ${item.PhoneNumber}`;
          reference = item.PhoneNumber?.toString();
          balance = undefined; // Traders don't have balance
          break;

        default:
          displayName = item.Name || item.Id?.toString();
          reference = item.Id?.toString();
      }

      return {
        Id: item.Id,
        DisplayName: displayName,
        Reference: reference,
        Balance: balance,
        AccountType: accountType
      };
    });
  }

  /**
   * Transform raw entity data to EntitySelectionModel
   * Maps different entity types to a common selection format with phone numbers
   */
  transformToEntitySelection(entityType: AccountTypeEnum, data: any[]): EntitySelectionModel[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map(item => {
      let displayName = '';
      let reference = '';
      let phoneNumber: string | undefined;
      let balance: number | undefined;

      switch (entityType) {
        case AccountTypeEnum.Wallet:
          displayName = `${item.Name} - ${item.PhoneNumber} (${item.Provider})`;
          reference = item.PhoneNumber?.toString();
          phoneNumber = item.PhoneNumber?.toString();
          balance = item.Balance;
          break;

        case AccountTypeEnum.BankAccount:
          displayName = `${item.AccountHolderName} - ${item.BankName} (${item.AccountNumber})`;
          reference = item.AccountNumber?.toString();
          phoneNumber = item.PhoneNumber?.toString(); // If available
          balance = item.Balance;
          break;

        case AccountTypeEnum.YellowCard:
          displayName = `${item.CardHolderName} - ${item.CardNumber}`;
          reference = item.CardNumber?.toString();
          phoneNumber = item.PhoneNumber?.toString(); // If available
          balance = item.Balance;
          break;

        case AccountTypeEnum.CreditCard:
          displayName = `${item.CardHolderName} - ${item.CardNumber}`;
          reference = item.CardNumber?.toString();
          phoneNumber = item.PhoneNumber?.toString(); // If available
          balance = item.Balance;
          break;

        case AccountTypeEnum.Trader:
          displayName = `${item.Name} - ${item.PhoneNumber}`;
          reference = item.PhoneNumber?.toString();
          phoneNumber = item.PhoneNumber?.toString();
          balance = undefined; // Traders don't have balance
          break;

        case AccountTypeEnum.FawryMachine:
          displayName = `${item.SerialNumber} - ${item.PhoneNumber}`;
          reference = item.SerialNumber?.toString();
          phoneNumber = item.PhoneNumber?.toString();
          balance = item.Balance;
          break;

        default:
          displayName = item.Name || item.Id?.toString();
          reference = item.Id?.toString();
          phoneNumber = item.PhoneNumber?.toString();
      }

      return {
        Id: item.Id,
        DisplayName: displayName,
        Reference: reference,
        PhoneNumber: phoneNumber,
        Balance: balance,
        EntityType: entityType
      };
    });
  }

  /**
   * Helper method to get provider name from enum value
   */
  private getProviderName(provider: number): string {
    const providers: { [key: number]: string } = {
      1: 'Vodafone',
      2: 'Etisalat',
      3: 'Access'
    };
    return providers[provider] || 'Unknown';
  }

  /**
   * Get transaction statistics (optional - for dashboard)
   */
  getTransactionStatistics(): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Transactions/Statistics`;
    return this.http.get<ResponseModel>(url);
  }

  /**
   * Upload transaction attachment
   * @param transactionId - Transaction ID
   * @param attachment - Attachment upload data
   */
  uploadAttachment(transactionId: number, attachment: TransactionAttachmentUpload): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Transactions/${transactionId}/Attachments`;
    return this.http.post<ResponseModel>(url, attachment);
  }

  /**
   * Upload multiple transaction attachments
   * @param transactionId - Transaction ID
   * @param attachments - Array of attachment upload data
   */
  uploadAttachments(transactionId: number, attachments: TransactionAttachmentUpload[]): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Transactions/${transactionId}/Attachments/Batch`;
    return this.http.post<ResponseModel>(url, { Attachments: attachments });
  }

  /**
   * Delete transaction attachment
   * @param transactionId - Transaction ID
   * @param attachmentId - Attachment ID
   */
  deleteAttachment(transactionId: number, attachmentId: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Transactions/${transactionId}/Attachments/${attachmentId}`;
    return this.http.delete<ResponseModel>(url);
  }

  /**
   * Convert file to base64 string for upload
   * @param file - File object to convert
   */
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Validate if sender and receiver are different entities
   * Used for InternalTransfer validation
   */
  validateDifferentEntities(
    senderEntityType: AccountTypeEnum,
    senderEntityId: number,
    receiverEntityType: AccountTypeEnum,
    receiverEntityId: number
  ): boolean {
    return !(senderEntityType === receiverEntityType && senderEntityId === receiverEntityId);
  }
}
