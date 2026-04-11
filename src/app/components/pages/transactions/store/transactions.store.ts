import { Injectable, signal, computed } from '@angular/core';
import { 
  TransactionModel, 
  TransactionPreviewResponse, 
  AccountSelectionModel,
  EntitySelectionModel,
  TransactionAttachmentUpload
} from '../core/models/transaction.model';
import { AdjustmentModel } from '../../adjustments/core/models/adjustment.model';
import { TransactionStatusEnum } from '../core/enums/transaction-status.enum';
import { TransactionTypeEnum } from '../core/enums/transaction-type.enum';

@Injectable({
  providedIn: 'root'
})
export class TransactionsStore {
  
  // ========== Signals ==========
  
  /**
   * Main transactions list signal
   */
  private transactionsSignal = signal<TransactionModel[]>([]);
  
  /**
   * Selected transaction for view/edit
   */
  private selectedTransactionSignal = signal<TransactionModel | null>(null);
  
  /**
   * Transaction preview result from backend (with adjustments)
   */
  private transactionPreviewSignal = signal<TransactionPreviewResponse | null>(null);
  
  /**
   * Available adjustments for selection
   */
  private adjustmentsOptionsSignal = signal<AdjustmentModel[]>([]);
  
  /**
   * Preview loading state
   */
  private previewLoadingSignal = signal<boolean>(false);
  
  /**
   * Available accounts for selected account type
   */
  private availableAccountsSignal = signal<AccountSelectionModel[]>([]);
  
  /**
   * Available recipient accounts (for transfers)
   */
  private availableRecipientAccountsSignal = signal<AccountSelectionModel[]>([]);
  
  /**
   * Available sender entities (with phone numbers)
   */
  private availableSenderEntitiesSignal = signal<EntitySelectionModel[]>([]);
  
  /**
   * Available receiver entities (with phone numbers)
   */
  private availableReceiverEntitiesSignal = signal<EntitySelectionModel[]>([]);
  
  /**
   * Current transaction type being created/edited
   */
  private currentTransactionTypeSignal = signal<TransactionTypeEnum | null>(null);
  
  /**
   * Pending attachments for upload
   */
  private pendingAttachmentsSignal = signal<TransactionAttachmentUpload[]>([]);
  
  /**
   * Loading state for async operations
   */
  private loadingSignal = signal<boolean>(false);

  // ========== Read-only Accessors ==========
  
  readonly transactions = this.transactionsSignal.asReadonly();
  readonly selectedTransaction = this.selectedTransactionSignal.asReadonly();
  readonly transactionPreview = this.transactionPreviewSignal.asReadonly();
  readonly adjustmentsOptions = this.adjustmentsOptionsSignal.asReadonly();
  readonly previewLoading = this.previewLoadingSignal.asReadonly();
  readonly availableAccounts = this.availableAccountsSignal.asReadonly();
  readonly availableRecipientAccounts = this.availableRecipientAccountsSignal.asReadonly();
  readonly availableSenderEntities = this.availableSenderEntitiesSignal.asReadonly();
  readonly availableReceiverEntities = this.availableReceiverEntitiesSignal.asReadonly();
  readonly currentTransactionType = this.currentTransactionTypeSignal.asReadonly();
  readonly pendingAttachments = this.pendingAttachmentsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  // ========== Computed Signals ==========
  
  /**
   * Computed: Pending transactions count
   */
  readonly pendingTransactionsCount = computed(() => {
    return this.transactionsSignal().filter(
      t => t.Status === TransactionStatusEnum.Pending
    ).length;
  });

  /**
   * Computed: Completed transactions count
   */
  readonly completedTransactionsCount = computed(() => {
    return this.transactionsSignal().filter(
      t => t.Status === TransactionStatusEnum.Completed
    ).length;
  });

  /**
   * Computed: Failed transactions count
   */
  readonly failedTransactionsCount = computed(() => {
    return this.transactionsSignal().filter(
      t => t.Status === TransactionStatusEnum.Failed
    ).length;
  });

  /**
   * Computed: Total transaction amount (completed only)
   */
  readonly totalTransactionAmount = computed(() => {
    return this.transactionsSignal()
      .filter(t => t.Status === TransactionStatusEnum.Completed)
      .reduce((sum, t) => sum + (t.NetAmount || 0), 0);
  });

  /**
   * Computed: Total adjustments increase (completed only)
   */
  readonly totalAdjustmentsIncrease = computed(() => {
    return this.transactionsSignal()
      .filter(t => t.Status === TransactionStatusEnum.Completed)
      .reduce((sum, t) => sum + (t.TotalIncrease || 0), 0);
  });
  
  /**
   * Computed: Total adjustments decrease (completed only)
   */
  readonly totalAdjustmentsDecrease = computed(() => {
    return this.transactionsSignal()
      .filter(t => t.Status === TransactionStatusEnum.Completed)
      .reduce((sum, t) => sum + (t.TotalDecrease || 0), 0);
  });

  // ========== Transactions Management ==========

  /**
   * Set the complete transactions list
   * @param transactions - Array of transaction models
   */
  setTransactions(transactions: TransactionModel[]): void {
    this.transactionsSignal.set(transactions);
  }

  /**
   * Add a single transaction to the list
   * @param transaction - Transaction model to add
   */
  addTransaction(transaction: TransactionModel): void {
    this.transactionsSignal.update(transactions => [...transactions, transaction]);
  }

  /**
   * Update a transaction in the list
   * @param updatedTransaction - Updated transaction model
   */
  updateTransaction(updatedTransaction: TransactionModel): void {
    this.transactionsSignal.update(transactions => 
      transactions.map(transaction => 
        transaction.Id === updatedTransaction.Id ? updatedTransaction : transaction
      )
    );
  }

  /**
   * Remove a transaction from the list
   * @param transactionId - ID of the transaction to remove
   */
  removeTransaction(transactionId: number): void {
    this.transactionsSignal.update(transactions => 
      transactions.filter(transaction => transaction.Id !== transactionId)
    );
  }

  /**
   * Clear all transactions
   */
  clearTransactions(): void {
    this.transactionsSignal.set([]);
  }

  /**
   * Get current transactions value (non-reactive)
   */
  getTransactionsValue(): TransactionModel[] {
    return this.transactionsSignal();
  }

  // ========== Selected Transaction Management ==========

  /**
   * Set the selected transaction
   * @param transaction - Transaction to select
   */
  setSelectedTransaction(transaction: TransactionModel | null): void {
    this.selectedTransactionSignal.set(transaction);
  }

  /**
   * Clear selected transaction
   */
  clearSelectedTransaction(): void {
    this.selectedTransactionSignal.set(null);
  }

  // ========== Transaction Preview Management ==========

  /**
   * Set transaction preview result from backend
   * @param preview - Transaction preview response
   */
  setTransactionPreview(preview: TransactionPreviewResponse | null): void {
    this.transactionPreviewSignal.set(preview);
  }

  /**
   * Clear transaction preview
   */
  clearTransactionPreview(): void {
    this.transactionPreviewSignal.set(null);
  }
  
  /**
   * Set preview loading state
   * @param loading - Loading state
   */
  setPreviewLoading(loading: boolean): void {
    this.previewLoadingSignal.set(loading);
  }
  
  // ========== Adjustments Options Management ==========
  
  /**
   * Set available adjustments for selection
   * @param adjustments - Array of adjustment models
   */
  setAdjustmentsOptions(adjustments: AdjustmentModel[]): void {
    this.adjustmentsOptionsSignal.set(adjustments);
  }
  
  /**
   * Clear adjustments options
   */
  clearAdjustmentsOptions(): void {
    this.adjustmentsOptionsSignal.set([]);
  }

  // ========== Available Accounts Management ==========

  /**
   * Set available accounts for selection
   * @param accounts - Array of account selection models
   */
  setAvailableAccounts(accounts: AccountSelectionModel[]): void {
    this.availableAccountsSignal.set(accounts);
  }

  /**
   * Clear available accounts
   */
  clearAvailableAccounts(): void {
    this.availableAccountsSignal.set([]);
  }

  /**
   * Set available recipient accounts (for transfers)
   * @param accounts - Array of account selection models
   */
  setAvailableRecipientAccounts(accounts: AccountSelectionModel[]): void {
    this.availableRecipientAccountsSignal.set(accounts);
  }

  /**
   * Clear available recipient accounts
   */
  clearAvailableRecipientAccounts(): void {
    this.availableRecipientAccountsSignal.set([]);
  }

  // ========== Loading State Management ==========

  /**
   * Set loading state
   * @param loading - Loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
  }

  // ========== Sender/Receiver Entities Management ==========

  /**
   * Set available sender entities
   * @param entities - Array of entity selection models
   */
  setAvailableSenderEntities(entities: EntitySelectionModel[]): void {
    this.availableSenderEntitiesSignal.set(entities);
  }

  /**
   * Clear available sender entities
   */
  clearAvailableSenderEntities(): void {
    this.availableSenderEntitiesSignal.set([]);
  }

  /**
   * Set available receiver entities
   * @param entities - Array of entity selection models
   */
  setAvailableReceiverEntities(entities: EntitySelectionModel[]): void {
    this.availableReceiverEntitiesSignal.set(entities);
  }

  /**
   * Clear available receiver entities
   */
  clearAvailableReceiverEntities(): void {
    this.availableReceiverEntitiesSignal.set([]);
  }

  // ========== Transaction Type Management ==========

  /**
   * Set current transaction type
   * @param transactionType - Transaction type
   */
  setCurrentTransactionType(transactionType: TransactionTypeEnum | null): void {
    this.currentTransactionTypeSignal.set(transactionType);
  }

  /**
   * Clear current transaction type
   */
  clearCurrentTransactionType(): void {
    this.currentTransactionTypeSignal.set(null);
  }

  // ========== Attachments Management ==========

  /**
   * Add attachment to pending list
   * @param attachment - Attachment upload data
   */
  addPendingAttachment(attachment: TransactionAttachmentUpload): void {
    this.pendingAttachmentsSignal.update(attachments => [...attachments, attachment]);
  }

  /**
   * Remove attachment from pending list
   * @param fileName - File name to remove
   */
  removePendingAttachment(fileName: string): void {
    this.pendingAttachmentsSignal.update(attachments => 
      attachments.filter(att => att.FileName !== fileName)
    );
  }

  /**
   * Set all pending attachments
   * @param attachments - Array of attachment upload data
   */
  setPendingAttachments(attachments: TransactionAttachmentUpload[]): void {
    this.pendingAttachmentsSignal.set(attachments);
  }

  /**
   * Clear all pending attachments
   */
  clearPendingAttachments(): void {
    this.pendingAttachmentsSignal.set([]);
  }

  /**
   * Get pending attachments count
   */
  getPendingAttachmentsCount(): number {
    return this.pendingAttachmentsSignal().length;
  }

  // ========== Utility Methods ==========

  /**
   * Filter transactions by status
   * @param status - Transaction status to filter by
   */
  getTransactionsByStatus(status: TransactionStatusEnum): TransactionModel[] {
    return this.transactionsSignal().filter(t => t.Status === status);
  }

  /**
   * Get transaction by ID
   * @param id - Transaction ID
   */
  getTransactionById(id: number): TransactionModel | undefined {
    return this.transactionsSignal().find(t => t.Id === id);
  }

  /**
   * Reset entire store to initial state
   */
  resetStore(): void {
    this.transactionsSignal.set([]);
    this.selectedTransactionSignal.set(null);
    this.transactionPreviewSignal.set(null);
    this.adjustmentsOptionsSignal.set([]);
    this.previewLoadingSignal.set(false);
    this.availableAccountsSignal.set([]);
    this.availableRecipientAccountsSignal.set([]);
    this.availableSenderEntitiesSignal.set([]);
    this.availableReceiverEntitiesSignal.set([]);
    this.currentTransactionTypeSignal.set(null);
    this.pendingAttachmentsSignal.set([]);
    this.loadingSignal.set(false);
  }

  /**
   * Reset form-related state (for new transaction)
   */
  resetFormState(): void {
    this.transactionPreviewSignal.set(null);
    this.adjustmentsOptionsSignal.set([]);
    this.previewLoadingSignal.set(false);
    this.availableSenderEntitiesSignal.set([]);
    this.availableReceiverEntitiesSignal.set([]);
    this.currentTransactionTypeSignal.set(null);
    this.pendingAttachmentsSignal.set([]);
  }
}
