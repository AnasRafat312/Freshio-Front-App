# Transactions Feature - Architecture Documentation

## Overview

A **fully reusable and dynamic** Transactions feature that works with all account types (Wallets, BankAccounts, YellowCards, CreditCards, Traders) without hardcoding business logic. Built with Angular Standalone Components and Signal-based state management.

---

## Folder Structure

```
src/app/components/pages/transactions/
│
├── core/
│   ├── enums/
│   │   ├── account-type.enum.ts          # AccountTypeEnum (Wallet, BankAccount, etc.)
│   │   ├── channel-type.enum.ts          # ChannelTypeEnum (ATM, Instapay, Fawry, POS)
│   │   ├── transaction-status.enum.ts    # TransactionStatusEnum (Pending, Completed, etc.)
│   │   └── transaction-type.enum.ts      # TransactionTypeEnum (Deposit, Withdrawal, etc.)
│   │
│   └── models/
│       └── transaction.model.ts          # All transaction-related interfaces
│
├── services/
│   └── transactions.service.ts           # HTTP service for API calls
│
├── store/
│   └── transactions.store.ts             # Signal-based state management
│
└── components/
    ├── add-edit/
    │   └── add-edit.component.ts         # Generic transaction form component
    │
    ├── list/
    │   └── transactions-list.component.ts # Transactions list component
    │
    └── details/
        └── details.component.ts          # Transaction details component (optional)
```

---

## Core Models & Enums

### Enums

#### 1. AccountTypeEnum
```typescript
export enum AccountTypeEnum {
  Wallet = 1,
  BankAccount = 2,
  YellowCard = 3,
  CreditCard = 4,
  Trader = 5
}
```

**Purpose**: Defines all supported account types for transactions.

#### 2. ChannelTypeEnum
```typescript
export enum ChannelTypeEnum {
  ATM = 1,
  Instapay = 2,
  Fawry = 3,
  POS = 4
}
```

**Purpose**: Defines execution channels. Channel has **no balance or calculation logic** on frontend.

#### 3. TransactionStatusEnum
```typescript
export enum TransactionStatusEnum {
  Pending = 1,
  Completed = 2,
  Failed = 3,
  Cancelled = 4,
  Processing = 5
}
```

**Purpose**: Tracks transaction lifecycle status.

#### 4. TransactionTypeEnum
```typescript
export enum TransactionTypeEnum {
  Deposit = 1,
  Withdrawal = 2,
  Transfer = 3,
  Payment = 4,
  Refund = 5
}
```

**Purpose**: Defines transaction operation types.

---

### Data Models

#### 1. TransactionModel
```typescript
interface TransactionModel extends BaseEntityModel {
  // Transaction Identification
  TransactionNumber: string;              // Unique reference number
  TransactionDate: Date | string;         // Transaction timestamp
  
  // Transaction Details
  TransactionType: TransactionTypeEnum;   // Type of transaction
  Amount: number;                         // Amount before fees
  Fees: number;                           // Calculated fees (READ-ONLY)
  NetAmount: number;                      // Final amount (READ-ONLY)
  
  // Account Information
  AccountType: AccountTypeEnum;           // Account type
  AccountId: number;                      // Selected account ID
  AccountReference: string;               // Display reference
  
  // Channel
  Channel: ChannelTypeEnum;               // Execution channel
  
  // Status
  Status: TransactionStatusEnum;          // Current status
  
  // Additional
  Description: string;                    // Transaction description
  ReferenceNumber?: string;               // External reference
  
  // Recipient (for transfers)
  RecipientAccountType?: AccountTypeEnum;
  RecipientAccountId?: number;
  RecipientReference?: string;
}
```

**Key Points**:
- `Fees` and `NetAmount` are **read-only** - calculated by backend only
- `AccountType` drives dynamic account loading
- `Channel` is selectable but has no frontend logic
- Supports recipient fields for transfer transactions

#### 2. AccountSelectionModel
```typescript
interface AccountSelectionModel {
  Id: number;                             // Account ID
  DisplayName: string;                    // Display text for dropdown
  Reference: string;                      // Account reference
  Balance?: number;                       // Current balance (if applicable)
  AccountType: AccountTypeEnum;           // Account type
}
```

**Purpose**: Generic model for displaying any account type in dropdowns.

**Example Display Names**:
- Wallet: `"Ahmed Ali - 01012345678 (Vodafone)"`
- BankAccount: `"Ahmed Ali - CIB (123456789)"`
- YellowCard: `"Ahmed Ali - 1234567890123456"`
- CreditCard: `"Ahmed Ali - 1234567890123456"`
- Trader: `"Electronics Store - 01012345678"`

#### 3. FeeCalculationRequest
```typescript
interface FeeCalculationRequest {
  TransactionType: TransactionTypeEnum;
  Amount: number;
  AccountType: AccountTypeEnum;
  AccountId: number;
  Channel: ChannelTypeEnum;
  RecipientAccountType?: AccountTypeEnum;
  RecipientAccountId?: number;
}
```

**Purpose**: Sent to backend to calculate fees based on transaction parameters.

#### 4. FeeCalculationResponse
```typescript
interface FeeCalculationResponse {
  Success: boolean;
  Amount: number;                         // Original amount
  Fees: number;                           // Calculated fees
  NetAmount: number;                      // Final amount
  FeeBreakdown?: FeeBreakdownItem[];      // Detailed breakdown
  Message?: string;
}
```

**Purpose**: Received from backend with calculated fees and breakdown.

#### 5. FeeBreakdownItem
```typescript
interface FeeBreakdownItem {
  FeeType: string;                        // e.g., "Service Fee", "Channel Fee"
  Amount: number;                         // Fee amount
  Description?: string;                   // Fee description
}
```

**Purpose**: Shows detailed fee components to user.

#### 6. TransactionCreateRequest
```typescript
interface TransactionCreateRequest {
  TransactionType: TransactionTypeEnum;
  Amount: number;
  AccountType: AccountTypeEnum;
  AccountId: number;
  Channel: ChannelTypeEnum;
  Description: string;
  ReferenceNumber?: string;
  RecipientAccountType?: AccountTypeEnum;
  RecipientAccountId?: number;
  CreatedBy: number;
  CreatedDateTime: Date | string;
}
```

**Purpose**: Payload sent to backend to create transaction.

#### 7. TransactionFilterModel
```typescript
interface TransactionFilterModel {
  TransactionNumber?: string;
  TransactionType?: TransactionTypeEnum;
  AccountType?: AccountTypeEnum;
  Channel?: ChannelTypeEnum;
  Status?: TransactionStatusEnum;
  DateFrom?: Date | string;
  DateTo?: Date | string;
  MinAmount?: number;
  MaxAmount?: number;
}
```

**Purpose**: Filter criteria for transactions list.

---

## Services Layer

### TransactionsService

**Location**: `services/transactions.service.ts`

**Purpose**: Handles all HTTP communication with backend API.

#### Key Methods

##### 1. getTransactions(filters?: TransactionFilterModel): void
```typescript
getTransactions(filters?: TransactionFilterModel): void
```
- Fetches all transactions from API
- Optionally applies filters
- Automatically updates store signal
- **No return value** - uses store pattern

##### 2. getTransactionById(id: number): Observable<ResponseModel>
```typescript
getTransactionById(id: number): Observable<ResponseModel>
```
- Fetches single transaction by ID
- Returns observable for component handling

##### 3. createTransaction(transaction: TransactionCreateRequest): Observable<ResponseModel>
```typescript
createTransaction(transaction: TransactionCreateRequest): Observable<ResponseModel>
```
- Creates new transaction
- Returns observable with created transaction data

##### 4. cancelTransaction(id: number): Observable<ResponseModel>
```typescript
cancelTransaction(id: number): Observable<ResponseModel>
```
- Cancels pending/processing transaction
- Returns observable with result

##### 5. calculateFees(request: FeeCalculationRequest): Observable<FeeCalculationResponse>
```typescript
calculateFees(request: FeeCalculationRequest): Observable<FeeCalculationResponse>
```
- **KEY METHOD**: Calculates fees from backend
- Called automatically when form values change
- Returns fee breakdown and net amount

##### 6. getAccountsByType(accountType: AccountTypeEnum): Observable<ResponseModel>
```typescript
getAccountsByType(accountType: AccountTypeEnum): Observable<ResponseModel>
```
- **DYNAMIC ACCOUNT LOADING**: Fetches accounts based on selected type
- Maps AccountTypeEnum to correct API endpoint:
  - `Wallet` → `ElectronicWallets/GetAll`
  - `BankAccount` → `BankAccounts/GetAll`
  - `YellowCard` → `YellowCards/GetAll`
  - `CreditCard` → `CreditCards/GetAll`
  - `Trader` → `Traders/GetAll`

##### 7. transformToAccountSelection(accountType: AccountTypeEnum, data: any[]): AccountSelectionModel[]
```typescript
transformToAccountSelection(accountType: AccountTypeEnum, data: any[]): AccountSelectionModel[]
```
- **TRANSFORMATION METHOD**: Converts different account types to common format
- Creates user-friendly display names
- Extracts relevant reference fields
- Handles balance where applicable

**Transformation Logic**:
```typescript
switch (accountType) {
  case AccountTypeEnum.Wallet:
    displayName = `${item.Name} - ${item.PhoneNumber} (${provider})`;
    reference = item.PhoneNumber;
    balance = item.Balance;
    break;
    
  case AccountTypeEnum.BankAccount:
    displayName = `${item.AccountHolderName} - ${item.BankName} (${item.AccountNumber})`;
    reference = item.AccountNumber;
    balance = item.Balance;
    break;
    
  // ... other cases
}
```

---

## State Management (Store)

### TransactionsStore

**Location**: `store/transactions.store.ts`

**Purpose**: Centralized state management using Angular Signals.

#### Signals

##### 1. Private Writable Signals
```typescript
private transactionsSignal = signal<TransactionModel[]>([]);
private selectedTransactionSignal = signal<TransactionModel | null>(null);
private feeCalculationSignal = signal<FeeCalculationResponse | null>(null);
private availableAccountsSignal = signal<AccountSelectionModel[]>([]);
private availableRecipientAccountsSignal = signal<AccountSelectionModel[]>([]);
private loadingSignal = signal<boolean>(false);
```

##### 2. Public Read-only Accessors
```typescript
readonly transactions = this.transactionsSignal.asReadonly();
readonly selectedTransaction = this.selectedTransactionSignal.asReadonly();
readonly feeCalculation = this.feeCalculationSignal.asReadonly();
readonly availableAccounts = this.availableAccountsSignal.asReadonly();
readonly availableRecipientAccounts = this.availableRecipientAccountsSignal.asReadonly();
readonly loading = this.loadingSignal.asReadonly();
```

##### 3. Computed Signals (Auto-calculated)
```typescript
readonly pendingTransactionsCount = computed(() => {
  return this.transactionsSignal().filter(
    t => t.Status === TransactionStatusEnum.Pending
  ).length;
});

readonly completedTransactionsCount = computed(() => { ... });
readonly failedTransactionsCount = computed(() => { ... });
readonly totalTransactionAmount = computed(() => { ... });
readonly totalFeesCollected = computed(() => { ... });
```

**Benefits**:
- Automatic recalculation when transactions change
- No manual subscription management
- Used for dashboard statistics

#### Store Methods

##### Transactions Management
```typescript
setTransactions(transactions: TransactionModel[]): void
addTransaction(transaction: TransactionModel): void
updateTransaction(updatedTransaction: TransactionModel): void
removeTransaction(transactionId: number): void
clearTransactions(): void
getTransactionsValue(): TransactionModel[]
```

##### Selected Transaction
```typescript
setSelectedTransaction(transaction: TransactionModel | null): void
clearSelectedTransaction(): void
```

##### Fee Calculation
```typescript
setFeeCalculation(feeCalculation: FeeCalculationResponse | null): void
clearFeeCalculation(): void
```

##### Available Accounts
```typescript
setAvailableAccounts(accounts: AccountSelectionModel[]): void
clearAvailableAccounts(): void
setAvailableRecipientAccounts(accounts: AccountSelectionModel[]): void
clearAvailableRecipientAccounts(): void
```

##### Utility Methods
```typescript
getTransactionsByStatus(status: TransactionStatusEnum): TransactionModel[]
getTransactionById(id: number): TransactionModel | undefined
resetStore(): void
```

---

## Component Architecture

### 1. TransactionsAddEditComponent

**Location**: `components/add-edit/add-edit.component.ts`

**Purpose**: Generic transaction form that works with all account types.

#### Form Structure
```typescript
form = FormGroup {
  // Transaction Type & Amount
  TransactionType: FormControl<TransactionTypeEnum>
  Amount: FormControl<number>
  
  // Dynamic Account Selection
  AccountType: FormControl<AccountTypeEnum>
  AccountId: FormControl<number>
  
  // Channel
  Channel: FormControl<ChannelTypeEnum>
  
  // Description
  Description: FormControl<string>
  ReferenceNumber: FormControl<string>
  
  // Recipient (conditional - only for transfers)
  RecipientAccountType: FormControl<AccountTypeEnum>
  RecipientAccountId: FormControl<number>
  
  // Read-only Display Fields
  Fees: FormControl<number> (disabled)
  NetAmount: FormControl<number> (disabled)
}
```

#### Key Features

##### 1. Dynamic Account Loading
```typescript
// Listen to AccountType changes
form.get('AccountType')?.valueChanges.subscribe(accountType => {
  if (accountType) {
    this.loadAccountsByType(accountType);
    this.form.patchValue({ AccountId: null });
  }
});
```

**Flow**:
1. User selects AccountType (e.g., Wallet)
2. Component calls `transactionsService.getAccountsByType(Wallet)`
3. Service fetches from `ElectronicWallets/GetAll`
4. Service transforms to `AccountSelectionModel[]`
5. Dropdown populated with formatted options
6. User selects specific account

##### 2. Conditional Recipient Fields
```typescript
// Show recipient fields only for transfers
form.get('TransactionType')?.valueChanges.subscribe(transactionType => {
  this.showRecipientFields = transactionType === TransactionTypeEnum.Transfer;
  
  if (this.showRecipientFields) {
    form.get('RecipientAccountType')?.setValidators(Validators.required);
    form.get('RecipientAccountId')?.setValidators(Validators.required);
  } else {
    form.get('RecipientAccountType')?.clearValidators();
    form.get('RecipientAccountId')?.clearValidators();
  }
});
```

##### 3. Automatic Fee Calculation
```typescript
// Listen to form changes with debounce
form.valueChanges
  .pipe(debounceTime(500), distinctUntilChanged())
  .subscribe(() => {
    this.calculateFeesIfReady();
  });

private calculateFeesIfReady(): void {
  // Check if all required fields are filled
  if (allFieldsValid) {
    this.calculateFees();
  }
}

private calculateFees(): void {
  const request: FeeCalculationRequest = {
    TransactionType: formValue.TransactionType,
    Amount: formValue.Amount,
    AccountType: formValue.AccountType,
    AccountId: formValue.AccountId,
    Channel: formValue.Channel,
    RecipientAccountType: formValue.RecipientAccountType,
    RecipientAccountId: formValue.RecipientAccountId
  };

  this.transactionsService.calculateFees(request).subscribe(response => {
    this.calculatedFees = response.Fees;
    this.netAmount = response.NetAmount;
    this.feeBreakdown = response.FeeBreakdown;
    
    // Update display fields
    this.form.patchValue({
      Fees: this.calculatedFees,
      NetAmount: this.netAmount
    });
    
    // Store in signal
    this.transactionsStore.setFeeCalculation(response);
  });
}
```

**Fee Calculation Flow**:
1. User fills form fields
2. After 500ms debounce, check if all required fields are valid
3. If valid, send `FeeCalculationRequest` to backend
4. Backend calculates fees based on:
   - Transaction type
   - Amount
   - Account type
   - Channel
   - Recipient (if transfer)
5. Frontend receives `FeeCalculationResponse`
6. Display fees and net amount (read-only)
7. Show fee breakdown if available

##### 4. Form Submission
```typescript
submit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const transactionRequest: TransactionCreateRequest = {
    TransactionType: formValue.TransactionType,
    Amount: formValue.Amount,
    AccountType: formValue.AccountType,
    AccountId: formValue.AccountId,
    Channel: formValue.Channel,
    Description: formValue.Description,
    ReferenceNumber: formValue.ReferenceNumber,
    RecipientAccountType: formValue.RecipientAccountType,
    RecipientAccountId: formValue.RecipientAccountId,
    CreatedBy: userId,
    CreatedDateTime: now
  };

  this.transactionsService.createTransaction(transactionRequest).subscribe({
    next: (response) => {
      if (response?.Success) {
        this.messageService.add({ severity: 'success', ... });
        this.ref.close(response?.Data);
      }
    },
    error: (error) => {
      this.messageService.add({ severity: 'error', ... });
    }
  });
}
```

#### Component Properties
```typescript
form: FormGroup;
languageFactor: 'en' | 'ar';

// Dropdown Options
accountTypeOptions: any[];
transactionTypeOptions: any[];
channelOptions: any[];
accountOptions: AccountSelectionModel[];
recipientAccountOptions: AccountSelectionModel[];

// Fee Calculation
calculatedFees: number;
netAmount: number;
feeBreakdown: FeeBreakdownItem[];
isCalculatingFees: boolean;

// UI State
showRecipientFields: boolean;
isLoadingAccounts: boolean;
```

---

### 2. TransactionsListComponent

**Location**: `components/list/transactions-list.component.ts`

**Purpose**: Display and manage transactions list with filtering and actions.

#### Key Features

##### 1. Signal-based Data Binding
```typescript
constructor() {
  // React to signal changes automatically
  effect(() => {
    this.mainList = this.transactionsStore.transactions();
    this.filteredList = [...this.mainList];
    
    // Update statistics from computed signals
    this.pendingCount = this.transactionsStore.pendingTransactionsCount();
    this.completedCount = this.transactionsStore.completedTransactionsCount();
    this.failedCount = this.transactionsStore.failedTransactionsCount();
    this.totalAmount = this.transactionsStore.totalTransactionAmount();
    this.totalFees = this.transactionsStore.totalFeesCollected();
  });
}
```

**Benefits**:
- Automatic UI updates when store changes
- No manual subscription management
- Statistics auto-calculated via computed signals

##### 2. Table Configuration
```typescript
model = {
  TransactionNumber: {
    filterType: FilterType.multi,
    header: 'Transaction Number'
  },
  TransactionDate: {
    filterType: FilterType.date,
    header: 'Transaction Date'
  },
  TransactionType: {
    filterType: FilterType.multi,
    header: 'Transaction Type',
    pipe: 'enum',
    enumType: TransactionTypeEnum
  },
  Amount: {
    filterType: FilterType.number,
    header: 'Amount'
  },
  Fees: {
    filterType: FilterType.number,
    header: 'Fees'
  },
  NetAmount: {
    filterType: FilterType.number,
    header: 'Net Amount'
  },
  AccountType: {
    filterType: FilterType.multi,
    header: 'Account Type',
    pipe: 'enum',
    enumType: AccountTypeEnum
  },
  Channel: {
    filterType: FilterType.multi,
    header: 'Channel',
    pipe: 'enum',
    enumType: ChannelTypeEnum
  },
  Status: {
    filterType: FilterType.multi,
    header: 'Status',
    pipe: 'enum',
    enumType: TransactionStatusEnum
  }
}
```

##### 3. Actions Based on Privileges
```typescript
getActionsList() {
  this.actionsList = [];
  
  if (this.View) {
    this.actionsList.push({
      tooltip: 'View',
      icon: 'pi pi-eye',
      styleClass: 'p-button-info',
      action: (row) => this.viewTransaction(row)
    });
  }
  
  if (this.Cancel) {
    this.actionsList.push({
      tooltip: 'Cancel',
      icon: 'pi pi-times',
      styleClass: 'p-button-danger',
      action: (row) => this.cancelTransaction(row.Id),
      // Conditional display - only for pending/processing
      condition: (row) => 
        row.Status === TransactionStatusEnum.Pending || 
        row.Status === TransactionStatusEnum.Processing
    });
  }
}
```

##### 4. Add Transaction
```typescript
addTransaction(): void {
  this.ref = this.dialogService.open(TransactionsAddEditComponent, {
    header: 'New Transaction',
    contentStyle: { overflow: 'auto' },
    data: null,
    baseZIndex: 10000,
    maximizable: true,
    resizable: true,
    styleClass: 'lg-dialog-width'
  });
  
  this.ref.onClose.subscribe((transaction) => {
    if (transaction) {
      this.transactionsStore.addTransaction(transaction);
    }
  });
}
```

##### 5. Cancel Transaction
```typescript
cancelTransaction(id: number): void {
  this.ref = this.dialogService.open(NewDeleteModalComponent, {
    header: 'Cancel Transaction',
    data: { 
      url: `${API_ENDPOINT}Transactions/Cancel/${id}`,
      id: id,
      message: 'Are you sure you want to cancel this transaction?'
    }
  });
  
  this.ref.onClose.subscribe((result) => {
    if (result) {
      const transaction = this.transactionsStore.getTransactionById(id);
      if (transaction) {
        const updatedTransaction = {
          ...transaction,
          Status: TransactionStatusEnum.Cancelled
        };
        this.transactionsStore.updateTransaction(updatedTransaction);
      }
    }
  });
}
```

##### 6. Helper Methods
```typescript
getStatusClass(status: TransactionStatusEnum): string {
  switch (status) {
    case TransactionStatusEnum.Completed: return 'badge-success';
    case TransactionStatusEnum.Pending: return 'badge-warning';
    case TransactionStatusEnum.Processing: return 'badge-info';
    case TransactionStatusEnum.Failed: return 'badge-danger';
    case TransactionStatusEnum.Cancelled: return 'badge-secondary';
  }
}

getAccountTypeDisplay(accountType: AccountTypeEnum): string {
  // Returns bilingual display name
}

getChannelDisplay(channel: ChannelTypeEnum): string {
  // Returns bilingual display name
}
```

---

## Data Flow Architecture

### 1. Transaction Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Select Transaction Type                                │
│  - User selects: Deposit / Withdrawal / Transfer / Payment      │
│  - If Transfer → Show recipient fields                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Select Account Type                                    │
│  - User selects: Wallet / BankAccount / YellowCard / etc.       │
│  - Trigger: loadAccountsByType(accountType)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Dynamic Account Loading                                │
│  - Service.getAccountsByType(accountType)                       │
│  - Maps to correct endpoint:                                    │
│    • Wallet → ElectronicWallets/GetAll                          │
│    • BankAccount → BankAccounts/GetAll                          │
│    • YellowCard → YellowCards/GetAll                            │
│    • etc.                                                        │
│  - Transform to AccountSelectionModel[]                         │
│  - Populate dropdown with formatted options                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Select Specific Account                                │
│  - User selects from dropdown                                   │
│  - Display shows: "Name - Reference (Provider/Bank)"            │
│  - Form stores: AccountId                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Select Channel                                         │
│  - User selects: ATM / Instapay / Fawry / POS                   │
│  - Channel has no frontend logic                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: Enter Amount                                           │
│  - User enters transaction amount                               │
│  - Triggers fee calculation (debounced 500ms)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 7: Automatic Fee Calculation                              │
│  - Build FeeCalculationRequest:                                 │
│    {                                                             │
│      TransactionType,                                            │
│      Amount,                                                     │
│      AccountType,                                                │
│      AccountId,                                                  │
│      Channel,                                                    │
│      RecipientAccountType?,                                      │
│      RecipientAccountId?                                         │
│    }                                                             │
│  - POST to: Transactions/CalculateFees                          │
│  - Backend calculates fees based on business rules              │
│  - Returns: FeeCalculationResponse                              │
│    {                                                             │
│      Success: true,                                              │
│      Amount: 1000,                                               │
│      Fees: 25,                                                   │
│      NetAmount: 1025,                                            │
│      FeeBreakdown: [                                             │
│        { FeeType: "Service Fee", Amount: 15 },                  │
│        { FeeType: "Channel Fee", Amount: 10 }                   │
│      ]                                                           │
│    }                                                             │
│  - Update form display fields (read-only)                       │
│  - Store in signal for reference                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 8: Display Fee Breakdown                                  │
│  - Show Amount: 1000                                             │
│  - Show Fees: 25 (with breakdown)                               │
│  - Show Net Amount: 1025                                         │
│  - All read-only, calculated by backend                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 9: Enter Description & Submit                             │
│  - User enters description                                      │
│  - Optional: Reference number                                   │
│  - Click Submit                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 10: Create Transaction                                    │
│  - Build TransactionCreateRequest                               │
│  - POST to: Transactions/Create                                 │
│  - Backend:                                                      │
│    • Validates transaction                                      │
│    • Checks account balance/limits                              │
│    • Processes transaction                                      │
│    • Updates account balances                                   │
│    • Returns created transaction                                │
│  - Frontend:                                                     │
│    • Add to store: transactionsStore.addTransaction()           │
│    • Close dialog                                                │
│    • Show success message                                        │
│    • List auto-updates via signal                               │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. Account Selection Flow (Dynamic Loading)

```
User Selects AccountType
         │
         ▼
┌────────────────────────┐
│  AccountType = Wallet  │
└────────────────────────┘
         │
         ▼
Service.getAccountsByType(Wallet)
         │
         ▼
┌─────────────────────────────────────┐
│  Maps to: ElectronicWallets/GetAll │
└─────────────────────────────────────┘
         │
         ▼
API Returns Raw Wallet Data:
[
  {
    Id: 1,
    Name: "Ahmed Ali",
    PhoneNumber: 1012345678,
    Provider: 1, // Vodafone
    Balance: 5000
  },
  {
    Id: 2,
    Name: "Sara Mohamed",
    PhoneNumber: 1098765432,
    Provider: 2, // Etisalat
    Balance: 3000
  }
]
         │
         ▼
Service.transformToAccountSelection(Wallet, data)
         │
         ▼
Transforms to AccountSelectionModel[]:
[
  {
    Id: 1,
    DisplayName: "Ahmed Ali - 1012345678 (Vodafone)",
    Reference: "1012345678",
    Balance: 5000,
    AccountType: Wallet
  },
  {
    Id: 2,
    DisplayName: "Sara Mohamed - 1098765432 (Etisalat)",
    Reference: "1098765432",
    Balance: 3000,
    AccountType: Wallet
  }
]
         │
         ▼
Store.setAvailableAccounts(accounts)
         │
         ▼
Dropdown Populated with Options:
- "Ahmed Ali - 1012345678 (Vodafone)"
- "Sara Mohamed - 1098765432 (Etisalat)"
         │
         ▼
User Selects Account
         │
         ▼
Form.AccountId = 1
```

**Same Flow for All Account Types**:
- BankAccount → `BankAccounts/GetAll` → Transform to `"Name - Bank (AccountNumber)"`
- YellowCard → `YellowCards/GetAll` → Transform to `"Name - CardNumber"`
- CreditCard → `CreditCards/GetAll` → Transform to `"Name - CardNumber"`
- Trader → `Traders/GetAll` → Transform to `"Name - PhoneNumber"`

---

### 3. Fee Calculation Flow

```
Form Values Change
         │
         ▼
Debounce 500ms
         │
         ▼
Check if all required fields filled:
- TransactionType ✓
- Amount ✓
- AccountType ✓
- AccountId ✓
- Channel ✓
- (RecipientAccountType ✓ if Transfer)
- (RecipientAccountId ✓ if Transfer)
         │
         ▼
Build FeeCalculationRequest
         │
         ▼
POST to: Transactions/CalculateFees
         │
         ▼
┌──────────────────────────────────────┐
│         BACKEND PROCESSING           │
│                                      │
│  1. Identify transaction type        │
│  2. Get account details              │
│  3. Get channel fees                 │
│  4. Apply business rules:            │
│     - Account type fees              │
│     - Channel fees                   │
│     - Transaction type fees          │
│     - Volume-based discounts         │
│     - Special promotions             │
│  5. Calculate total fees             │
│  6. Calculate net amount             │
│  7. Build fee breakdown              │
└──────────────────────────────────────┘
         │
         ▼
Return FeeCalculationResponse:
{
  Success: true,
  Amount: 1000,
  Fees: 25,
  NetAmount: 1025,
  FeeBreakdown: [
    {
      FeeType: "Service Fee",
      Amount: 15,
      Description: "Standard service charge"
    },
    {
      FeeType: "Channel Fee",
      Amount: 10,
      Description: "Instapay processing fee"
    }
  ]
}
         │
         ▼
Frontend Updates:
- form.Fees = 25 (read-only)
- form.NetAmount = 1025 (read-only)
- feeBreakdown = [...] (display in UI)
- store.setFeeCalculation(response)
         │
         ▼
User Sees:
┌─────────────────────────┐
│ Amount:      1000 EGP   │
│ Fees:          25 EGP   │
│   - Service Fee: 15     │
│   - Channel Fee: 10     │
│ ─────────────────────   │
│ Net Amount:  1025 EGP   │
└─────────────────────────┘
```

---

## UI Flow Description

### Transaction Form UI Flow

#### Initial State
```
┌────────────────────────────────────────────────────────┐
│                  New Transaction                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Transaction Type: [Select Type ▼]                     │
│                    (Deposit, Withdrawal, Transfer, ...) │
│                                                         │
│  Amount: [________] EGP                                 │
│                                                         │
│  Account Type: [Select Account Type ▼]                 │
│                (Wallet, Bank Account, Yellow Card, ...) │
│                                                         │
│  Account: [Select Account ▼] (disabled until type)     │
│                                                         │
│  Channel: [Select Channel ▼]                           │
│           (ATM, Instapay, Fawry, POS)                  │
│                                                         │
│  Description: [_____________________________]          │
│                                                         │
│  Reference Number: [_____________________] (optional)  │
│                                                         │
│  ─────────────────────────────────────────────────     │
│  Fees: 0.00 EGP (calculated automatically)             │
│  Net Amount: 0.00 EGP                                  │
│  ─────────────────────────────────────────────────     │
│                                                         │
│              [Cancel]  [Submit]                         │
└────────────────────────────────────────────────────────┘
```

#### After Selecting "Transfer" Transaction Type
```
┌────────────────────────────────────────────────────────┐
│                  New Transaction                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Transaction Type: [Transfer ▼]                        │
│                                                         │
│  Amount: [________] EGP                                 │
│                                                         │
│  ═══════════════════════════════════════════════       │
│  FROM ACCOUNT                                           │
│  ═══════════════════════════════════════════════       │
│  Account Type: [Select Account Type ▼]                 │
│  Account: [Select Account ▼]                           │
│                                                         │
│  ═══════════════════════════════════════════════       │
│  TO ACCOUNT (Recipient)                                 │
│  ═══════════════════════════════════════════════       │
│  Recipient Account Type: [Select Account Type ▼]       │
│  Recipient Account: [Select Account ▼]                 │
│                                                         │
│  Channel: [Select Channel ▼]                           │
│  Description: [_____________________________]          │
│  Reference Number: [_____________________]             │
│                                                         │
│  ─────────────────────────────────────────────────     │
│  Fees: 0.00 EGP                                        │
│  Net Amount: 0.00 EGP                                  │
│  ─────────────────────────────────────────────────     │
│                                                         │
│              [Cancel]  [Submit]                         │
└────────────────────────────────────────────────────────┘
```

#### After Selecting Account Type (e.g., Wallet)
```
┌────────────────────────────────────────────────────────┐
│                  New Transaction                        │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Transaction Type: [Deposit ▼]                         │
│                                                         │
│  Amount: [1000] EGP                                     │
│                                                         │
│  Account Type: [Wallet ▼]                              │
│                                                         │
│  Account: [Select Account ▼]                           │
│    ┌─────────────────────────────────────────────┐    │
│    │ Ahmed Ali - 1012345678 (Vodafone)           │    │
│    │ Sara Mohamed - 1098765432 (Etisalat)        │    │
│    │ Mohamed Hassan - 1123456789 (Access)        │    │
│    └─────────────────────────────────────────────┘    │
│                                                         │
│  Channel: [Instapay ▼]                                 │
│                                                         │
│  Description: [Salary deposit]                         │
│                                                         │
│  ─────────────────────────────────────────────────     │
│  💰 Fee Calculation                                    │
│  ─────────────────────────────────────────────────     │
│  Amount:           1,000.00 EGP                        │
│  Fees:                25.00 EGP                        │
│    • Service Fee:     15.00 EGP                        │
│    • Channel Fee:     10.00 EGP                        │
│  ─────────────────────────────────────────────────     │
│  Net Amount:       1,025.00 EGP                        │
│  ─────────────────────────────────────────────────     │
│                                                         │
│              [Cancel]  [Submit]                         │
└────────────────────────────────────────────────────────┘
```

### Transactions List UI Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  Transactions                                    [+ New Transaction] │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📊 Statistics                                                    │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐       │
│  │ Pending  │Completed │  Failed  │  Total   │Total Fees│       │
│  │    15    │   1,234  │    8     │ 125,000  │  3,250   │       │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘       │
│                                                                   │
│  🔍 Filters                                                       │
│  Transaction Number: [_______]  Date From: [____] To: [____]    │
│  Type: [All ▼]  Account Type: [All ▼]  Status: [All ▼]         │
│                                                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                   │
│  Transaction List                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ # │ Trans# │ Date │ Type │ Amount │ Fees │ Net │ Status │ │ │
│  ├───┼────────┼──────┼──────┼────────┼──────┼─────┼────────┼─┤ │
│  │ 1 │ TRX001 │ 1/9  │ Dep  │ 1,000  │  25  │1,025│ ✓ Done │👁│ │
│  │ 2 │ TRX002 │ 1/9  │ With │  500   │  15  │ 485 │ ⏳ Pend│👁│ │
│  │ 3 │ TRX003 │ 1/8  │ Trans│ 2,000  │  50  │2,050│ ✓ Done │👁│ │
│  │ 4 │ TRX004 │ 1/8  │ Pay  │  750   │  20  │ 770 │ ❌ Fail│👁│ │
│  └───┴────────┴──────┴──────┴────────┴──────┴─────┴────────┴─┘ │
│                                                                   │
│  Showing 1-10 of 1,257 transactions        [◀] Page 1/126 [▶]  │
└──────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Required Backend Endpoints

#### 1. Transactions Endpoints
```
GET    /Transactions/GetAll
POST   /Transactions/GetAll (with filters)
GET    /Transactions/GetById/{id}
POST   /Transactions/Create
PUT    /Transactions/Cancel/{id}
POST   /Transactions/CalculateFees
GET    /Transactions/Statistics (optional)
```

#### 2. Account Endpoints (Already Exist)
```
GET    /ElectronicWallets/GetAll
GET    /BankAccounts/GetAll
GET    /YellowCards/GetAll
GET    /CreditCards/GetAll
GET    /Traders/GetAll
```

---

## Key Design Principles

### 1. **No Hardcoded Business Logic**
- All fee calculations done by backend
- No account-specific logic in frontend
- Channel has no frontend logic
- Frontend only displays and collects data

### 2. **Dynamic Account Loading**
- Account type selection drives API endpoint
- Single transformation method handles all account types
- No if/else chains for account types in components

### 3. **Reusability**
- One form works for all transaction scenarios
- One service method handles all account types
- One transformation method for all account formats

### 4. **Signal-Based Reactivity**
- Automatic UI updates
- No manual subscription management
- Computed signals for statistics
- Clean component lifecycle

### 5. **Type Safety**
- Strong TypeScript interfaces
- Enums for all categorical data
- No `any` types in critical paths

### 6. **Separation of Concerns**
- Models: Data structures only
- Services: HTTP and transformation logic
- Store: State management only
- Components: UI logic and user interaction

---

## Extension Points

### Adding New Account Type

**Step 1**: Add to enum
```typescript
export enum AccountTypeEnum {
  Wallet = 1,
  BankAccount = 2,
  YellowCard = 3,
  CreditCard = 4,
  Trader = 5,
  NewAccountType = 6  // ← Add here
}
```

**Step 2**: Add endpoint mapping in service
```typescript
getAccountsByType(accountType: AccountTypeEnum): Observable<ResponseModel> {
  switch (accountType) {
    // ... existing cases
    case AccountTypeEnum.NewAccountType:
      endpoint = 'NewAccounts/GetAll';
      break;
  }
}
```

**Step 3**: Add transformation logic
```typescript
transformToAccountSelection(accountType: AccountTypeEnum, data: any[]) {
  switch (accountType) {
    // ... existing cases
    case AccountTypeEnum.NewAccountType:
      displayName = `${item.Name} - ${item.Reference}`;
      reference = item.Reference;
      balance = item.Balance;
      break;
  }
}
```

**That's it!** No component changes needed.

### Adding New Channel

**Step 1**: Add to enum
```typescript
export enum ChannelTypeEnum {
  ATM = 1,
  Instapay = 2,
  Fawry = 3,
  POS = 4,
  NewChannel = 5  // ← Add here
}
```

**Step 2**: Add display name in list component
```typescript
getChannelDisplay(channel: ChannelTypeEnum): string {
  const channels = {
    // ... existing channels
    [ChannelTypeEnum.NewChannel]: { en: 'New Channel', ar: 'قناة جديدة' }
  };
}
```

**That's it!** Channel logic is on backend.

### Adding New Transaction Type

**Step 1**: Add to enum
```typescript
export enum TransactionTypeEnum {
  Deposit = 1,
  Withdrawal = 2,
  Transfer = 3,
  Payment = 4,
  Refund = 5,
  NewType = 6  // ← Add here
}
```

**Step 2**: If needs recipient fields, update condition
```typescript
form.get('TransactionType')?.valueChanges.subscribe(transactionType => {
  this.showRecipientFields = 
    transactionType === TransactionTypeEnum.Transfer ||
    transactionType === TransactionTypeEnum.NewType;  // ← Add here if needed
});
```

---

## Testing Strategy

### Unit Tests

#### Store Tests
```typescript
describe('TransactionsStore', () => {
  it('should add transaction to list');
  it('should update transaction in list');
  it('should remove transaction from list');
  it('should calculate pending count correctly');
  it('should calculate total fees correctly');
});
```

#### Service Tests
```typescript
describe('TransactionsService', () => {
  it('should fetch transactions from API');
  it('should map account type to correct endpoint');
  it('should transform wallet data correctly');
  it('should transform bank account data correctly');
  it('should calculate fees via API');
});
```

#### Component Tests
```typescript
describe('TransactionsAddEditComponent', () => {
  it('should load accounts when account type selected');
  it('should show recipient fields for transfers');
  it('should calculate fees automatically');
  it('should validate form before submit');
});
```

### Integration Tests

```typescript
describe('Transaction Creation Flow', () => {
  it('should create transaction end-to-end');
  it('should handle fee calculation errors');
  it('should update store after creation');
});
```

---

## Performance Considerations

### 1. Debounced Fee Calculation
- 500ms debounce prevents excessive API calls
- Only calculates when all required fields are valid

### 2. Signal-Based Updates
- Fine-grained reactivity
- Only affected components re-render
- No unnecessary change detection cycles

### 3. Lazy Loading
- Accounts loaded only when account type selected
- Not all accounts loaded upfront

### 4. Computed Signals
- Statistics calculated once per transaction list change
- Cached until dependencies change

---

## Security Considerations

### 1. Authorization
- Privilege-based action control
- Backend validates all transactions
- User ID from localStorage (consider token-based auth)

### 2. Validation
- Frontend validation for UX
- Backend validation for security
- No trust in frontend calculations

### 3. Sensitive Data
- Fees calculated by backend only
- No balance manipulation on frontend
- Transaction limits enforced by backend

---

## Summary

This architecture provides:

✅ **Fully Generic**: Works with all account types without hardcoding  
✅ **Dynamic**: Account loading based on user selection  
✅ **Reusable**: One form for all transaction scenarios  
✅ **Maintainable**: Clear separation of concerns  
✅ **Extensible**: Easy to add new account types, channels, or transaction types  
✅ **Type-Safe**: Strong TypeScript throughout  
✅ **Reactive**: Signal-based state management  
✅ **Performant**: Debounced calculations, computed signals  
✅ **Secure**: Backend-driven business logic  

The frontend is a **thin presentation layer** that:
- Collects user input
- Displays data from backend
- Manages UI state
- Provides good UX

All business logic, calculations, and validations remain on the backend where they belong.
