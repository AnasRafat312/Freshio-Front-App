# Transaction Feature Architecture Documentation

## Overview
This document describes the updated Transactions feature architecture with support for Sender/Receiver entities, phone numbers, internal transfers, and attachments.

## Folder Structure

```
transactions/
├── components/
│   ├── add-edit/
│   │   ├── add-edit.component.ts          # Original component (deprecated)
│   │   ├── add-edit-updated.component.ts  # New component with Sender/Receiver
│   │   ├── add-edit.component.html
│   │   └── add-edit.component.scss
│   ├── list/
│   │   ├── transactions-list.component.ts
│   │   ├── transactions-list.component.html
│   │   └── transactions-list.component.scss
│   └── details/
│       ├── details.component.ts
│       ├── details.component.html
│       └── details.component.scss
├── core/
│   ├── enums/
│   │   ├── account-type.enum.ts           # Wallet, BankAccount, YellowCard, CreditCard, Trader
│   │   ├── channel-type.enum.ts           # ATM, Instapay, Fawry, POS
│   │   ├── transaction-status.enum.ts     # Pending, Completed, Failed, Cancelled, Processing
│   │   └── transaction-type.enum.ts       # Deposit, Withdrawal, Transfer, Payment, Refund, InternalTransfer
│   ├── models/
│   │   └── transaction.model.ts           # All interfaces and models
│   └── helpers/
│       └── transaction-type-config.helper.ts  # Configuration logic for transaction types
├── services/
│   └── transactions.service.ts            # API calls and data transformation
└── store/
    └── transactions.store.ts              # Signal-based state management
```

---

## Core Models

### TransactionModel
Main transaction entity with Sender/Receiver structure:
```typescript
interface TransactionModel {
  // Identification
  TransactionNumber: string;
  TransactionDate: Date | string;
  
  // Transaction Details
  TransactionType: TransactionTypeEnum;
  Amount: number;
  Fees: number;                    // Read-only from backend
  NetAmount: number;               // Read-only from backend
  
  // Sender Information
  SenderEntityType: AccountTypeEnum;
  SenderEntityId: number;
  SenderReference?: string;
  SenderPhoneNumber?: string;
  
  // Receiver Information
  ReceiverEntityType?: AccountTypeEnum;
  ReceiverEntityId?: number;
  ReceiverReference?: string;
  ReceiverPhoneNumber?: string;
  
  // Channel & Status
  Channel: ChannelTypeEnum;
  Status: TransactionStatusEnum;
  
  // Additional
  Description: string;
  ReferenceNumber?: string;
  Attachments?: TransactionAttachment[];
}
```

### EntitySelectionModel
Generic model for Sender/Receiver entity dropdowns:
```typescript
interface EntitySelectionModel {
  Id: number;
  DisplayName: string;           // e.g., "Vodafone - 01012345678"
  Reference: string;             // Phone, account number, card number
  PhoneNumber?: string;          // Phone number if applicable
  Balance?: number;              // Current balance
  EntityType: AccountTypeEnum;
}
```

### TransactionAttachmentUpload
For uploading attachments:
```typescript
interface TransactionAttachmentUpload {
  FileName: string;
  FileType: string;              // MIME type
  FileSize: number;              // Bytes
  FileData: string;              // Base64 encoded
}
```

---

## Transaction Type Configurations

### 1. Deposit
**Behavior:**
- Show Sender and Receiver sections
- Sender is always Trader (fixed, dropdown hidden)
- Sender phone number is required
- Receiver can be: Wallet, BankAccount, YellowCard, CreditCard

**Form Fields:**
```
✓ TransactionType: Deposit
✓ Amount
✓ SenderEntityType: Trader (fixed, hidden)
✓ SenderEntityId: [Trader dropdown]
✓ SenderPhoneNumber: [Required]
✓ ReceiverEntityType: [Wallet/BankAccount/YellowCard/CreditCard]
✓ ReceiverEntityId: [Entity dropdown based on type]
✓ Channel
✓ Description
```

**Validation:**
- SenderEntityType = Trader (auto-set)
- SenderEntityId required
- SenderPhoneNumber required (10-15 digits)
- ReceiverEntityType required
- ReceiverEntityId required

---

### 2. Withdrawal
**Behavior:**
- Show Sender section only
- Hide Receiver entity section
- Show Receiver phone number input (required)
- Sender can be: Wallet, BankAccount, YellowCard

**Form Fields:**
```
✓ TransactionType: Withdrawal
✓ Amount
✓ SenderEntityType: [Wallet/BankAccount/YellowCard]
✓ SenderEntityId: [Entity dropdown based on type]
✓ ReceiverPhoneNumber: [Required]
✓ Channel
✓ Description
```

**Validation:**
- SenderEntityType required
- SenderEntityId required
- ReceiverPhoneNumber required (10-15 digits)
- ReceiverEntityType and ReceiverEntityId not required

---

### 3. Payment
**Behavior:**
- Show Sender section only
- Hide Receiver entity section
- Show Receiver phone number input (required)
- Sender can be: Wallet, BankAccount, YellowCard

**Form Fields:**
```
✓ TransactionType: Payment
✓ Amount
✓ SenderEntityType: [Wallet/BankAccount/YellowCard]
✓ SenderEntityId: [Entity dropdown based on type]
✓ ReceiverPhoneNumber: [Required]
✓ Channel
✓ Description
```

**Validation:**
- Same as Withdrawal

---

### 4. Refund
**Behavior:**
- Show Sender and Receiver sections
- Sender is always Trader (fixed, dropdown hidden)
- Sender phone number is required
- Receiver can be: Wallet, BankAccount, YellowCard, CreditCard

**Form Fields:**
```
✓ TransactionType: Refund
✓ Amount
✓ SenderEntityType: Trader (fixed, hidden)
✓ SenderEntityId: [Trader dropdown]
✓ SenderPhoneNumber: [Required]
✓ ReceiverEntityType: [Wallet/BankAccount/YellowCard/CreditCard]
✓ ReceiverEntityId: [Entity dropdown based on type]
✓ Channel
✓ Description
```

**Validation:**
- Same as Deposit

---

### 5. InternalTransfer
**Behavior:**
- Show both Sender and Receiver sections
- Both entity types are selectable from all AccountTypes
- Sender and Receiver cannot be the same entity
- Phone numbers optional

**Form Fields:**
```
✓ TransactionType: InternalTransfer
✓ Amount
✓ SenderEntityType: [All types: Wallet/BankAccount/YellowCard/CreditCard/Trader]
✓ SenderEntityId: [Entity dropdown based on type]
✓ SenderPhoneNumber: [Optional, auto-filled]
✓ ReceiverEntityType: [All types: Wallet/BankAccount/YellowCard/CreditCard/Trader]
✓ ReceiverEntityId: [Entity dropdown based on type]
✓ ReceiverPhoneNumber: [Optional, auto-filled]
✓ Channel
✓ Description
```

**Validation:**
- SenderEntityType required
- SenderEntityId required
- ReceiverEntityType required
- ReceiverEntityId required
- **Special validation:** Sender and Receiver cannot be the same (SenderEntityType === ReceiverEntityType && SenderEntityId === ReceiverEntityId)

---

## Conditional UI Flow

### Step 1: User Selects Transaction Type
```typescript
onTransactionTypeChange(transactionType) {
  // Get configuration
  const config = TransactionTypeConfigHelper.getConfig(transactionType);
  
  // Update UI visibility
  this.showSenderSection = config.showSenderSection;
  this.showReceiverSection = config.showReceiverSection;
  this.senderEntityTypeFixed = config.senderEntityTypeFixed;
  
  // Filter dropdown options
  this.senderEntityTypeOptions = getFilteredOptions(config.allowedSenderTypes);
  this.receiverEntityTypeOptions = getFilteredOptions(config.allowedReceiverTypes);
  
  // Configure validators
  configureSenderValidators(config);
  configureReceiverValidators(config);
  
  // Auto-set fixed values
  if (config.senderEntityTypeFixed) {
    form.patchValue({ SenderEntityType: config.fixedSenderEntityType });
  }
}
```

### Step 2: User Selects Sender Entity Type
```typescript
onSenderEntityTypeChange(entityType) {
  // Load entities from backend
  loadSenderEntitiesByType(entityType);
  
  // Reset entity selection
  form.patchValue({ SenderEntityId: null });
}
```

### Step 3: User Selects Sender Entity
```typescript
onSenderEntityIdChange(entityId) {
  // Auto-fill phone number if available
  const entity = senderEntityOptions.find(e => e.Id === entityId);
  if (entity?.PhoneNumber) {
    form.patchValue({ SenderPhoneNumber: entity.PhoneNumber });
  }
  
  // Trigger fee calculation
  calculateFeesIfReady();
}
```

### Step 4: User Selects Receiver Entity Type (if applicable)
```typescript
onReceiverEntityTypeChange(entityType) {
  // Load entities from backend
  loadReceiverEntitiesByType(entityType);
  
  // Reset entity selection
  form.patchValue({ ReceiverEntityId: null });
}
```

### Step 5: User Selects Receiver Entity (if applicable)
```typescript
onReceiverEntityIdChange(entityId) {
  // Auto-fill phone number if available
  const entity = receiverEntityOptions.find(e => e.Id === entityId);
  if (entity?.PhoneNumber) {
    form.patchValue({ ReceiverPhoneNumber: entity.PhoneNumber });
  }
  
  // Validate different entities for InternalTransfer
  if (transactionType === InternalTransfer) {
    validateDifferentEntities();
  }
  
  // Trigger fee calculation
  calculateFeesIfReady();
}
```

---

## Fee Calculation Flow

### When to Calculate Fees
Fees are calculated automatically when ALL required fields are filled:
1. TransactionType
2. Amount > 0
3. SenderEntityType
4. SenderEntityId
5. Channel
6. ReceiverEntityType (if required by transaction type)
7. ReceiverEntityId (if required by transaction type)

### Fee Calculation Request
```typescript
const request: FeeCalculationRequest = {
  TransactionType: formValue.TransactionType,
  Amount: formValue.Amount,
  SenderEntityType: formValue.SenderEntityType,
  SenderEntityId: formValue.SenderEntityId,
  Channel: formValue.Channel,
  ReceiverEntityType: formValue.ReceiverEntityType,  // Optional
  ReceiverEntityId: formValue.ReceiverEntityId       // Optional
};

transactionsService.calculateFees(request).subscribe(response => {
  // Update form with calculated values
  form.patchValue({
    Fees: response.Fees,
    NetAmount: response.NetAmount
  });
  
  // Store fee breakdown
  this.feeBreakdown = response.FeeBreakdown;
});
```

### Fee Display
- **Fees:** Read-only field, calculated by backend
- **NetAmount:** Read-only field, calculated by backend
- **FeeBreakdown:** Optional detailed breakdown (e.g., Service Fee, Channel Fee)

---

## Attachments Handling

### Upload Flow
```typescript
// 1. User selects files
onFileSelect(event) {
  const files = event.target.files;
  
  // Validate each file
  for (file of files) {
    // Check file type (image/png, image/jpeg, application/pdf)
    // Check file size (max 5MB)
    
    // Convert to base64
    const base64Data = await convertFileToBase64(file);
    
    // Add to pending attachments
    const attachment: TransactionAttachmentUpload = {
      FileName: file.name,
      FileType: file.type,
      FileSize: file.size,
      FileData: base64Data
    };
    
    transactionsStore.addPendingAttachment(attachment);
  }
}

// 2. Submit transaction with attachments
const transactionRequest: TransactionCreateRequest = {
  // ... other fields
  Attachments: this.pendingAttachments
};

transactionsService.createTransaction(transactionRequest);
```

### Attachment Constraints
- **Max Attachments:** 5 per transaction
- **Max File Size:** 5MB per file
- **Allowed Types:** image/png, image/jpeg, image/jpg, application/pdf

---

## Validation Rules Summary

| Transaction Type | Sender Entity | Sender Phone | Receiver Entity | Receiver Phone | Same Entity Check |
|-----------------|---------------|--------------|-----------------|----------------|-------------------|
| Deposit         | Trader (fixed)| Required     | Required        | Optional       | No                |
| Withdrawal      | Required      | Optional     | Not shown       | Required       | No                |
| Payment         | Required      | Optional     | Not shown       | Required       | No                |
| Refund          | Trader (fixed)| Required     | Required        | Optional       | No                |
| InternalTransfer| Required      | Optional     | Required        | Optional       | Yes (must differ) |

---

## Data Flow Architecture

### 1. Component Layer
- Handles user interactions
- Manages form state
- Triggers service calls
- Reacts to store signals

### 2. Service Layer
- API communication
- Data transformation (raw data → EntitySelectionModel)
- File conversion (File → Base64)
- Business logic (validation, fee calculation)

### 3. Store Layer (Signals)
- Centralized state management
- Reactive data flow
- Computed values (statistics, counts)
- State persistence across components

### Signal Flow Example
```typescript
// Component triggers action
transactionsService.getAccountsByType(AccountTypeEnum.Wallet);

// Service updates store
transactionsStore.setAvailableSenderEntities(entities);

// Component reacts to signal change
effect(() => {
  this.senderEntityOptions = this.transactionsStore.availableSenderEntities();
});
```

---

## API Endpoints

### Transaction Operations
- `GET /Transactions/GetAll` - Get all transactions
- `GET /Transactions/GetById/{id}` - Get transaction by ID
- `POST /Transactions/Create` - Create new transaction
- `PUT /Transactions/Cancel/{id}` - Cancel transaction
- `POST /Transactions/CalculateFees` - Calculate fees

### Entity Operations
- `GET /ElectronicWallets/GetAll` - Get all wallets
- `GET /BankAccounts/GetAll` - Get all bank accounts
- `GET /YellowCards/GetAll` - Get all yellow cards
- `GET /CreditCards/GetAll` - Get all credit cards
- `GET /Traders/GetAll` - Get all traders

### Attachment Operations
- `POST /Transactions/{id}/Attachments` - Upload single attachment
- `POST /Transactions/{id}/Attachments/Batch` - Upload multiple attachments
- `DELETE /Transactions/{id}/Attachments/{attachmentId}` - Delete attachment

---

## Implementation Checklist

### Backend Requirements
- [ ] Update Transaction entity with Sender/Receiver fields
- [ ] Implement fee calculation endpoint
- [ ] Add attachment upload endpoints
- [ ] Add validation for InternalTransfer (different entities)
- [ ] Update transaction creation logic

### Frontend Implementation
- [x] Update enums (add InternalTransfer)
- [x] Update models (Sender/Receiver structure)
- [x] Create TransactionTypeConfigHelper
- [x] Update TransactionsService (entity loading, attachments)
- [x] Update TransactionsStore (new signals)
- [x] Create updated add-edit component
- [ ] Update HTML template (conditional sections)
- [ ] Update list component (display Sender/Receiver)
- [ ] Update details component (display Sender/Receiver, attachments)
- [ ] Add attachment preview component
- [ ] Add unit tests
- [ ] Add integration tests

### UI/UX Considerations
- [ ] Show/hide sections based on transaction type
- [ ] Disable entity type dropdown when fixed (Deposit/Refund)
- [ ] Auto-fill phone numbers from selected entities
- [ ] Display loading states during entity loading
- [ ] Show fee calculation in progress
- [ ] Display fee breakdown details
- [ ] Show attachment previews
- [ ] Add attachment remove functionality
- [ ] Validate file types and sizes
- [ ] Show validation errors inline
- [ ] Display success/error messages

---

## Testing Strategy

### Unit Tests
- TransactionTypeConfigHelper methods
- Service transformation methods
- Store signal updates
- Form validation logic

### Integration Tests
- Transaction type change flow
- Entity loading and selection
- Fee calculation trigger
- Attachment upload
- Form submission

### E2E Tests
- Complete Deposit flow
- Complete Withdrawal flow
- Complete InternalTransfer flow
- Attachment upload and remove
- Validation error handling

---

## Migration Notes

### Breaking Changes
- `AccountType` → `SenderEntityType`
- `AccountId` → `SenderEntityId`
- `RecipientAccountType` → `ReceiverEntityType`
- `RecipientAccountId` → `ReceiverEntityId`

### Data Migration
If existing transactions need to be migrated:
```sql
UPDATE Transactions
SET SenderEntityType = AccountType,
    SenderEntityId = AccountId,
    ReceiverEntityType = RecipientAccountType,
    ReceiverEntityId = RecipientAccountId;
```

### Backward Compatibility
The old `add-edit.component.ts` is kept for reference but should be replaced with `add-edit-updated.component.ts` after testing.

---

## Performance Considerations

1. **Lazy Loading:** Entity lists are loaded only when entity type is selected
2. **Debounced Fee Calculation:** 500ms debounce to avoid excessive API calls
3. **Signal-based Reactivity:** Efficient change detection with Angular signals
4. **File Size Limits:** Prevent large file uploads (5MB max)
5. **Attachment Count Limit:** Max 5 attachments per transaction

---

## Security Considerations

1. **File Validation:** Strict file type and size validation
2. **Base64 Encoding:** Files encoded before transmission
3. **Authorization:** All API calls require authentication
4. **Input Sanitization:** Phone numbers validated with regex
5. **Entity Validation:** Backend validates entity ownership

---

## Future Enhancements

1. **Bulk Transactions:** Support multiple transactions in one submission
2. **Scheduled Transactions:** Allow future-dated transactions
3. **Recurring Transactions:** Support recurring payment patterns
4. **Transaction Templates:** Save common transaction configurations
5. **Advanced Fee Rules:** More complex fee calculation logic
6. **Attachment Preview:** In-app preview for images and PDFs
7. **Transaction History:** Track all changes to a transaction
8. **Notifications:** Real-time transaction status updates
