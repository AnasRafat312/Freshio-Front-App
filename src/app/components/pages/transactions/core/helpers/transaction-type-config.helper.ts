import { TransactionTypeEnum } from '../enums/transaction-type.enum';
import { AccountTypeEnum } from '../enums/account-type.enum';
import { TransactionTypeConfig } from '../models/transaction.model';

/**
 * Transaction Type Configuration Helper
 * Provides configuration and validation rules for each transaction type
 */
export class TransactionTypeConfigHelper {
  
  /**
   * Get configuration for a specific transaction type
   */
  static getConfig(transactionType: TransactionTypeEnum): TransactionTypeConfig {
    const configs: { [key in TransactionTypeEnum]: TransactionTypeConfig } = {
      [TransactionTypeEnum.Deposit]: {
        transactionType: TransactionTypeEnum.Deposit,
        showSenderSection: true,
        showReceiverSection: true,
        senderEntityTypeFixed: true,
        fixedSenderEntityType: AccountTypeEnum.Trader,
        senderEntityRequired: false,
        senderPhoneRequired: true,
        receiverPhoneRequired: false,
        receiverEntityRequired: true,
        allowedSenderTypes: [AccountTypeEnum.Trader],
        allowedReceiverTypes: [
          AccountTypeEnum.Wallet,
          AccountTypeEnum.BankAccount,
          AccountTypeEnum.YellowCard,
          AccountTypeEnum.CreditCard
        ],
        validateSameEntity: false
      },
      
      [TransactionTypeEnum.Withdrawal]: {
        transactionType: TransactionTypeEnum.Withdrawal,
        showSenderSection: true,
        showReceiverSection: false,
        senderEntityTypeFixed: false,
        senderEntityRequired: true,
        senderPhoneRequired: false,
        receiverPhoneRequired: true,
        receiverEntityRequired: false,
        allowedSenderTypes: [
          AccountTypeEnum.Wallet,
          AccountTypeEnum.BankAccount,
          AccountTypeEnum.YellowCard
        ],
        allowedReceiverTypes: [],
        validateSameEntity: false
      },
      
      [TransactionTypeEnum.InternalTransfer]: {
        transactionType: TransactionTypeEnum.InternalTransfer,
        showSenderSection: true,
        showReceiverSection: true,
        senderEntityTypeFixed: false,
        senderEntityRequired: true,
        senderPhoneRequired: false,
        receiverPhoneRequired: false,
        receiverEntityRequired: true,
        allowedSenderTypes: [
          AccountTypeEnum.Wallet,
          AccountTypeEnum.BankAccount,
          AccountTypeEnum.YellowCard,
          AccountTypeEnum.CreditCard
        ],
        allowedReceiverTypes: [
          AccountTypeEnum.Wallet,
          AccountTypeEnum.BankAccount,
          AccountTypeEnum.YellowCard,
          AccountTypeEnum.CreditCard
        ],
        validateSameEntity: false
      },
      
      [TransactionTypeEnum.Payment]: {
        transactionType: TransactionTypeEnum.Payment,
        showSenderSection: true,
        showReceiverSection: false,
        senderEntityTypeFixed: false,
        senderEntityRequired: true,
        senderPhoneRequired: false,
        receiverPhoneRequired: true,
        receiverEntityRequired: false,
        allowedSenderTypes: [
          AccountTypeEnum.Wallet,
          AccountTypeEnum.BankAccount,
          AccountTypeEnum.YellowCard
        ],
        allowedReceiverTypes: [],
        validateSameEntity: false
      },
      
      [TransactionTypeEnum.Refund]: {
        transactionType: TransactionTypeEnum.Refund,
        showSenderSection: true,
        showReceiverSection: true,
        senderEntityTypeFixed: true,
        fixedSenderEntityType: AccountTypeEnum.Trader,
        senderEntityRequired: true,
        senderPhoneRequired: true,
        receiverPhoneRequired: false,
        receiverEntityRequired: true,
        allowedSenderTypes: [AccountTypeEnum.Trader],
        allowedReceiverTypes: [
          AccountTypeEnum.Wallet,
          AccountTypeEnum.BankAccount,
          AccountTypeEnum.YellowCard,
          AccountTypeEnum.CreditCard
        ],
        validateSameEntity: false
      },
    };
    
    return configs[transactionType];
  }
  
  /**
   * Check if sender section should be shown
   */
  static shouldShowSenderSection(transactionType: TransactionTypeEnum): boolean {
    return this.getConfig(transactionType).showSenderSection;
  }
  
  /**
   * Check if receiver section should be shown
   */
  static shouldShowReceiverSection(transactionType: TransactionTypeEnum): boolean {
    return this.getConfig(transactionType).showReceiverSection;
  }
  
  /**
   * Check if sender entity type is fixed
   */
  static isSenderEntityTypeFixed(transactionType: TransactionTypeEnum): boolean {
    return this.getConfig(transactionType).senderEntityTypeFixed;
  }
  
  /**
   * Get fixed sender entity type (if applicable)
   */
  static getFixedSenderEntityType(transactionType: TransactionTypeEnum): AccountTypeEnum | undefined {
    return this.getConfig(transactionType).fixedSenderEntityType;
  }
  
  /**
   * Check if sender entity is required
   */
  static isSenderEntityRequired(transactionType: TransactionTypeEnum): boolean {
    return this.getConfig(transactionType).senderEntityRequired;
  }
  
  /**
   * Check if sender phone number is required
   */
  static isSenderPhoneRequired(transactionType: TransactionTypeEnum): boolean {
    return this.getConfig(transactionType).senderPhoneRequired;
  }
  
  /**
   * Check if receiver phone number is required
   */
  static isReceiverPhoneRequired(transactionType: TransactionTypeEnum): boolean {
    return this.getConfig(transactionType).receiverPhoneRequired;
  }
  
  /**
   * Check if receiver entity is required
   */
  static isReceiverEntityRequired(transactionType: TransactionTypeEnum): boolean {
    return this.getConfig(transactionType).receiverEntityRequired;
  }
  
  /**
   * Get allowed sender entity types
   */
  static getAllowedSenderTypes(transactionType: TransactionTypeEnum): AccountTypeEnum[] {
    return this.getConfig(transactionType).allowedSenderTypes;
  }
  
  /**
   * Get allowed receiver entity types
   */
  static getAllowedReceiverTypes(transactionType: TransactionTypeEnum): AccountTypeEnum[] {
    return this.getConfig(transactionType).allowedReceiverTypes;
  }
  
  /**
   * Check if same entity validation is required
   */
  static shouldValidateSameEntity(transactionType: TransactionTypeEnum): boolean {
    return this.getConfig(transactionType).validateSameEntity;
  }
  
  /**
   * Validate if sender and receiver are different (for InternalTransfer)
   */
  static validateDifferentEntities(
    senderEntityType: AccountTypeEnum,
    senderEntityId: number,
    receiverEntityType: AccountTypeEnum,
    receiverEntityId: number
  ): boolean {
    return !(senderEntityType === receiverEntityType && senderEntityId === receiverEntityId);
  }
  
  /**
   * Get filtered entity type options based on transaction type and role (sender/receiver)
   */
  static getFilteredEntityTypeOptions(
    transactionType: TransactionTypeEnum,
    isSender: boolean,
    allEntityTypes: { label: string; value: number }[]
  ): { label: string; value: number }[] {
    const allowedTypes = isSender
      ? this.getAllowedSenderTypes(transactionType)
      : this.getAllowedReceiverTypes(transactionType);
    
    return allEntityTypes.filter(option => allowedTypes.includes(option.value));
  }
}
