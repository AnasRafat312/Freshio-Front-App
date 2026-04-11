import { BaseEntityModel } from 'src/app/core/common/basic.model';
import { AccountTypeEnum } from '../enums/account-type.enum';
import { ChannelTypeEnum } from '../enums/channel-type.enum';
import { TransactionStatusEnum } from '../enums/transaction-status.enum';
import { TransactionTypeEnum } from '../enums/transaction-type.enum';
import { AdjustmentDirection } from 'src/app/components/pages/adjustments/core/enums/adjustment-direction.enum';
import { AdjustmentAppliesTo } from 'src/app/components/pages/adjustments/core/enums/adjustment-applies-to.enum';
import { AdjustmentType } from 'src/app/components/pages/adjustments/core/enums/adjustment-type.enum';
import { CalculationType } from 'src/app/components/pages/adjustments/core/enums/calculation-type.enum';

/**
 * Main Transaction Model
 * Represents a generic transaction with Sender/Receiver entities
 */
export interface TransactionModel extends BaseEntityModel {
  // Transaction Identification
  TransactionNumber: string;              // Unique transaction reference number
  TransactionDate: Date | string;         // When transaction was initiated
  
  // Transaction Details
  TransactionType: TransactionTypeEnum;   // Type of transaction (Deposit, Withdrawal, etc.)
  Amount: number;                         // Transaction base amount
  BaseAmount: number;                     // Base amount (same as Amount)
  TotalIncrease: number;                  // Total increase from adjustments (read-only)
  TotalDecrease: number;                  // Total decrease from adjustments (read-only)
  NetAmount: number;                      // Final amount (BaseAmount + TotalIncrease - TotalDecrease) - read-only
  AdjustmentsBreakdown?: TransactionAdjustmentBreakdown[];  // Adjustment details (for preview)
  TransactionAdjustments?: TransactionAdjustmentDetail[];   // Applied adjustments (from backend)
  
  // Sender Information
  SenderEntityType: AccountTypeEnum;      // Type of sender entity (Wallet, BankAccount, Trader, etc.)
  SenderEntityId: number;                 // ID of the sender entity
  SenderReference?: string;               // Display reference (phone, account number, card number)
  SenderPhoneNumber?: string;             // Sender phone number (required for Deposit/Refund)
  
  // Receiver Information
  ReceiverEntityType?: AccountTypeEnum;   // Type of receiver entity (optional for Withdraw/Payment)
  ReceiverEntityId?: number;              // ID of the receiver entity (optional)
  ReceiverReference?: string;             // Receiver display reference (optional)
  ReceiverPhoneNumber?: string;           // Receiver phone number (required for Withdraw/Payment)
  
  // Channel Information
  Channel: ChannelTypeEnum;               // Execution channel (ATM, Instapay, etc.)
  
  // Status & Processing
  Status: TransactionStatusEnum;          // Current transaction status
  
  // Additional Information
  Description: string;                    // Transaction description/notes
  ReferenceNumber?: string;               // External reference number (optional)
  
  // Attachments
  Attachments?: TransactionAttachment[];  // Transaction attachments (images, files)
}

/**
 * Account Selection Item
 * Generic model for displaying accounts in dropdown
 */
export interface AccountSelectionModel {
  Id: number;                             // Account ID
  DisplayName: string;                    // Display text (e.g., "Vodafone - 01012345678")
  Reference: string;                      // Account reference (phone, account number, etc.)
  Balance?: number;                       // Current balance (if applicable)
  AccountType: AccountTypeEnum;           // Type of account
}

/**
 * Transaction Preview Request
 * Sent to backend to calculate adjustments preview
 */
export interface TransactionPreviewRequest {
  TransactionType: TransactionTypeEnum;
  BaseAmount: number;
  SenderEntityType: AccountTypeEnum;
  SenderEntityId: number;
  Channel: ChannelTypeEnum;
  ReceiverEntityType?: AccountTypeEnum;
  ReceiverEntityId?: number;
  AdjustmentIds: number[];                // Selected adjustment template IDs
}

/**
 * Transaction Preview Response
 * Received from backend with calculated adjustments
 */
export interface TransactionPreviewResponse {
  Success: boolean;
  BaseAmount: number;                     // Original amount
  TotalIncrease: number;                  // Total increase from adjustments
  TotalDecrease: number;                  // Total decrease from adjustments
  NetAmount: number;                      // Final amount (BaseAmount + TotalIncrease - TotalDecrease)
  Adjustments?: TransactionAdjustmentBreakdown[];  // Detailed adjustment breakdown
  Message?: string;                       // Any message from backend
}

/**
 * Transaction Adjustment Breakdown
 * Details of individual adjustment applied to transaction (for preview)
 */
export interface TransactionAdjustmentBreakdown {
  AdjustmentId: number;
  Name: string;                           // Adjustment name
  AdjustmentName?: string;                // Alternative name field (for backward compatibility)
  AdjustmentType: AdjustmentType;
  AdjustmentTypeName?: string;            // Human-readable type name
  CalculationType: CalculationType;
  CalculationTypeName?: string;           // Human-readable calculation type name
  Value: number;                          // Template value (percentage or fixed)
  CalculatedAmount: number;               // Calculated amount for this transaction
  Direction: AdjustmentDirection;         // Increase or Decrease
  DirectionName?: string;                 // Human-readable direction name
  AppliesTo: AdjustmentAppliesTo;         // Sender, Receiver, or System
  AppliesToName?: string;                 // Human-readable applies to name
  Description?: string;
}

/**
 * Transaction Adjustment Detail
 * Applied adjustment details from backend (for transaction details view)
 */
export interface TransactionAdjustmentDetail {
  Id: number;
  TransactionId: number;
  AdjustmentId: number;
  CalculatedAmount: number;
  Direction: number;
  DirectionName: string;
  AppliesTo: number;
  AppliesToName: string;
  AdjustmentName: string;
  AdjustmentType: number;
  AdjustmentTypeName: string;
  CalculationType: number;
  CalculationTypeName: string;
  Value: number;
  Description?: string;
}

/**
 * Transaction Create Request
 * Payload sent to backend to create transaction
 */
export interface TransactionCreateRequest {
  TransactionType: TransactionTypeEnum;
  Amount: number;
  SenderEntityType: AccountTypeEnum;
  SenderEntityId: number;
  SenderPhoneNumber?: string;
  ReceiverEntityType?: AccountTypeEnum;
  ReceiverEntityId?: number;
  ReceiverPhoneNumber?: string;
  Channel: ChannelTypeEnum;
  Description: string;
  ReferenceNumber?: string;
  AdjustmentIds: number[];                // Selected adjustment template IDs
  Attachments?: TransactionAttachmentUpload[];
}

/**
 * Transaction Filter Model
 * For filtering transactions list
 */
export interface TransactionFilterModel {
  TransactionNumber?: string;
  TransactionType?: TransactionTypeEnum;
  SenderEntityType?: AccountTypeEnum;
  ReceiverEntityType?: AccountTypeEnum;
  Channel?: ChannelTypeEnum;
  Status?: TransactionStatusEnum;
  DateFrom?: Date | string;
  DateTo?: Date | string;
  MinAmount?: number;
  MaxAmount?: number;
}

/**
 * Transaction Attachment Model
 * Represents an uploaded attachment for a transaction
 */
export interface TransactionAttachment {
  Id: number;
  FileName: string;
  FileType: string;                       // MIME type (e.g., 'image/png', 'application/pdf')
  FileSize: number;                       // Size in bytes
  FileUrl: string;                        // URL to access the file
  UploadedDate: Date | string;
  UploadedBy: number;
}

/**
 * Transaction Attachment Upload
 * Payload for uploading attachments
 */
export interface TransactionAttachmentUpload {
  FileName: string;
  FileType: string;
  FileSize: number;
  FileData: string;                       // Base64 encoded file data
}

/**
 * Entity Selection Model
 * Generic model for displaying entities (Sender/Receiver) in dropdown
 */
export interface EntitySelectionModel {
  Id: number;
  DisplayName: string;                    // Display text (e.g., "Vodafone - 01012345678")
  Reference: string;                      // Entity reference (phone, account number, etc.)
  PhoneNumber?: string;                   // Phone number if applicable
  Balance?: number;                       // Current balance (if applicable)
  EntityType: AccountTypeEnum;            // Type of entity
}

/**
 * Transaction Type Configuration
 * Defines behavior and validation rules for each transaction type
 */
export interface TransactionTypeConfig {
  transactionType: TransactionTypeEnum;
  showSenderSection: boolean;
  showReceiverSection: boolean;
  senderEntityTypeFixed: boolean;         // If true, SenderEntityType is fixed (e.g., Trader for Deposit)
  fixedSenderEntityType?: AccountTypeEnum;// Fixed sender entity type value
  senderEntityRequired: boolean;          // If true, SenderEntityType and SenderEntity are required
  senderPhoneRequired: boolean;
  receiverPhoneRequired: boolean;
  receiverEntityRequired: boolean;
  allowedSenderTypes: AccountTypeEnum[];  // Allowed sender entity types
  allowedReceiverTypes: AccountTypeEnum[];// Allowed receiver entity types
  validateSameEntity: boolean;            // If true, sender and receiver cannot be the same
}
