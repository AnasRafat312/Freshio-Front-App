# Business Logic & Data Models Documentation

This document provides business logic and data model documentation for the core payment method components in the E-Transactions System.

## Table of Contents
- [Base Entity Model](#base-entity-model)
- [Wallets](#wallets)
- [Bank Accounts](#bank-accounts)
- [Yellow Cards](#yellow-cards)
- [Credit Cards](#credit-cards)
- [Traders](#traders)

---

## Base Entity Model

All entities in the system inherit from `BaseEntityModel`, which provides common audit and tracking fields.

### BaseEntityModel Interface
```typescript
interface BaseEntityModel {
  Id: number;                    // Unique identifier for the entity
  IsDeleted: Boolean;            // Soft delete flag
  CreatedBy: number;             // User ID who created the record
  CreatedDateTime: Date;         // Timestamp when record was created
  DeletedBy?: number;            // User ID who deleted the record (optional)
  DeletedDateTime?: Date;        // Timestamp when record was deleted (optional)
  CompanyID?: number;            // Associated company identifier (optional)
}
```

### Business Purpose
- **Audit Trail**: Tracks who created and deleted records
- **Soft Delete**: Allows data recovery by marking records as deleted instead of permanent removal
- **Multi-tenancy**: Supports company-based data segregation via CompanyID
- **Temporal Tracking**: Maintains creation and deletion timestamps

---

## Wallets

### Business Overview
The Wallets module manages electronic wallet accounts for mobile money services. It supports multiple telecom providers and tracks financial limits, balances, and usage patterns to ensure compliance with transaction limits and prevent fraud.

### Business Rules
- Each wallet is linked to a phone number and national ID
- Daily and monthly transaction limits are enforced
- Usage tracking prevents exceeding limits
- Wallets can be available or unavailable
- Supports three major telecom providers in the market

### WalletModel Interface
```typescript
interface WalletModel extends BaseEntityModel {
  PhoneNumber: number;           // Mobile number associated with the wallet
  Name: string;                  // Account holder's name
  MonthlyLimit: number;          // Maximum allowed monthly transactions (in currency)
  DailyLimit: number;            // Maximum allowed daily transactions (in currency)
  Balance: number;               // Current available balance in the wallet
  Status: WalletStatusEnum;      // Current operational status
  NationalId: number;            // National identification number for KYC
  Provider: WalletProviderEnum;  // Telecom provider operating the wallet
  MonthlyUsed?: number;          // Total amount used in current month
  DailyUsed?: number;            // Total amount used today
  Notes: string;                 // Administrative notes or remarks
}
```

### Enums

#### WalletStatusEnum
```typescript
enum WalletStatusEnum {
  Available = 1,      // Wallet is active and can process transactions
  Unavailable = 2     // Wallet is inactive or suspended
}
```

#### WalletProviderEnum
```typescript
enum WalletProviderEnum {
  Vodafone = 1,       // Vodafone Cash service
  Etisalat = 2,       // Etisalat mobile wallet
  Access = 3          // Access mobile wallet service
}
```

### Business Use Cases
1. **Customer Registration**: Register new wallet accounts with KYC verification
2. **Transaction Processing**: Process payments while enforcing daily/monthly limits
3. **Balance Management**: Track and update wallet balances
4. **Limit Monitoring**: Monitor usage against configured limits
5. **Provider Management**: Support multiple wallet providers
6. **Status Control**: Enable/disable wallets based on compliance or fraud detection

### Component Logic

#### WalletsList Component
**Location**: `src/app/components/pages/wallets/components/list/wallets-list.component.ts`

**Purpose**: Displays and manages the list of electronic wallets with filtering, CRUD operations, and privilege-based access control.

**Key Features**:
- **Reactive Data Management**: Uses Angular Signals for automatic UI updates
- **Privilege-Based Actions**: Dynamically shows/hides actions based on user permissions
- **Multi-language Support**: English and Arabic interface
- **Advanced Filtering**: Supports multi-select and numeric filters for all fields

**Component Properties**:
```typescript
mainList: WalletModel[]          // Complete list of wallets
filteredList: WalletModel[]      // Filtered list for display
model: any                       // Filter configuration object
actionsList: ActionData[]        // Available actions (Edit, Delete, Details)
Edit/Add/Delete/Details: boolean // Permission flags
languageFactor: 'en' | 'ar'     // Current language
```

**Key Methods**:

1. **getAllRows()**
   - Fetches all wallets from the API
   - Automatically updates the store signal
   - Called on component initialization

2. **initializeModel()**
   - Configures table columns with bilingual headers
   - Sets up filter types for each column
   - Defines which fields are visible/filterable

3. **showActionBaseOnPrivilege()**
   - Checks user privileges for the WalletsList page
   - Enables/disables CRUD actions based on permissions
   - Dynamically builds the actions list

4. **getActionsList()**
   - Builds the action buttons array
   - Adds Edit and Delete buttons if user has permissions
   - Each action includes icon, tooltip, and callback

5. **addEdit(row?: WalletModel)**
   - Opens dialog for adding new wallet or editing existing
   - Sets appropriate header based on language and mode
   - On dialog close, updates store with new/modified wallet

6. **deleteRow(id: number)**
   - Opens confirmation dialog
   - On confirmation, calls API and removes from store
   - Updates UI automatically via signal

**Data Flow**:
```
Component Init → getAllRows() → Service.getElectronicWallets() 
→ API Call → Store.setWallets() → Signal Update → UI Auto-Update
```

### Service Layer

#### WalletsService
**Location**: `src/app/components/pages/wallets/services/wallets.service.ts`

**Purpose**: Handles HTTP communication with the backend API for wallet operations.

**Methods**:

1. **getElectronicWallets(): void**
   - Endpoint: `GET /ElectronicWallets/GetAll`
   - Fetches all wallets from the server
   - Automatically updates WalletsStore on success
   - Handles errors with console logging

**API Integration**:
```typescript
URL: ${API_ENDPOINT}ElectronicWallets/GetAll
Method: GET
Response: ResponseModel { Success: boolean, Data: WalletModel[] }
```

### State Management

#### WalletsStore
**Location**: `src/app/components/pages/wallets/store/wallets.store.ts`

**Purpose**: Centralized state management using Angular Signals for reactive data handling.

**Signal Architecture**:
```typescript
private walletsSignal = signal<WalletModel[]>([]);
readonly wallets = this.walletsSignal.asReadonly();
```

**Methods**:

1. **setWallets(wallets: WalletModel[]): void**
   - Replaces entire wallets list
   - Used when fetching from API

2. **addWallet(wallet: WalletModel): void**
   - Adds a single wallet to the list
   - Uses immutable update pattern

3. **updateWallet(updatedWallet: WalletModel): void**
   - Updates existing wallet by ID
   - Preserves other wallets unchanged

4. **removeWallet(walletId: number): void**
   - Removes wallet from list by ID
   - Filters out the deleted wallet

5. **clearWallets(): void**
   - Resets store to empty state

6. **getWalletsValue(): WalletModel[]**
   - Returns current non-reactive snapshot
   - Useful for one-time reads

**Benefits of Signal-Based Store**:
- Automatic change detection
- No manual subscription management
- Better performance with fine-grained reactivity
- Simplified component logic

### Filter Configuration

The wallets list supports the following filters:

| Field | Filter Type | English Header | Arabic Header |
|-------|-------------|----------------|---------------|
| PhoneNumber | Multi-select | Phone Number | رقم التيليفون |
| Name | Multi-select | Name | الأسم |
| MonthlyLimit | Numeric | Monthly Limit | الحد الشهري |
| MonthlyUsed | Numeric | Monthly Used | الإستخدام الشهري |
| DailyLimit | Numeric | Daily Limit | الحد اليومي |
| DailyUsed | Numeric | Daily Used | الإستخدام اليومي |
| Balance | Numeric | Balance | الرصيد |
| Status | Multi-select | Status | الحالة |
| Provider | Multi-select | Provider | المقدم |

---

## Bank Accounts

### Overview
The Bank Accounts module manages traditional bank account information for users, including account holder details, balances, and banking information.

### Data Model

#### BankAccountModel
```typescript
interface BankAccountModel extends BaseEntityModel {
  AccountHolderName: string;  // Name of account holder
  PhoneNumber: number;        // Contact phone number
  Balance: number;            // Current account balance
  BankName: string;           // Name of the bank
  AccountNumber: number;      // Bank account number
  IBAN: number;              // International Bank Account Number
}
```

### Component Logic

#### BankAccountsList Component
**Location**: `src/app/components/pages/bank-accounts/components/list/bank-accounts-list.component.ts`

**Purpose**: Manages the display and operations for bank accounts with filtering and CRUD functionality.

**Key Features**:
- Signal-based reactive data management
- Privilege-based access control
- Bilingual support (English/Arabic)
- Advanced filtering capabilities

**Component Properties**:
```typescript
mainList: BankAccountModel[]     // Complete list of bank accounts
filteredList: BankAccountModel[] // Filtered list for display
model: any                       // Filter configuration
actionsList: ActionData[]        // Available actions
Edit/Add/Delete/Details: boolean // Permission flags
languageFactor: 'en' | 'ar'     // Current language
```

**Key Methods**:

1. **getAllRows()**
   - Fetches all bank accounts from API
   - Triggers service to update store

2. **initializeModel()**
   - Configures table columns and filters
   - Sets bilingual headers
   - Defines filter types per column

3. **showActionBaseOnPrivilege()**
   - Evaluates user permissions for BankAccountsList
   - Builds action buttons based on privileges
   - Includes Edit, Delete, and Details actions

4. **addEdit(row?: BankAccountModel)**
   - Opens dialog for add/edit operations
   - Displays appropriate header based on mode
   - Currently commented out auto-refresh on close

5. **deleteRow(row: any)**
   - Opens confirmation dialog
   - Prepares delete model with metadata
   - Currently commented out auto-refresh on success

**Data Flow**:
```
Component Init → getAllRows() → Service.getBankAccounts() 
→ API Call → Store.setBankAccounts() → Signal Update → UI Refresh
```

### Service Layer

#### BankAccountsService
**Location**: `src/app/components/pages/bank-accounts/services/bank-accounts.service.ts`

**Purpose**: Handles HTTP operations for bank account data.

**Methods**:

1. **getBankAccounts(): void**
   - Endpoint: `GET /BankAccounts/GetAll`
   - Fetches all bank accounts
   - Updates store on success
   - Error handling with console logging

**API Integration**:
```typescript
URL: ${API_ENDPOINT}BankAccounts/GetAll
Method: GET
Response: ResponseModel { Success: boolean, Data: BankAccountModel[] }
```

### State Management

#### BankAccountsStore
**Location**: `src/app/components/pages/bank-accounts/store/bank-accounts.store.ts`

**Purpose**: Centralized state management using Angular Signals.

**Signal Architecture**:
```typescript
private bankAccountsSignal = signal<BankAccountModel[]>([]);
readonly bankAccounts = this.bankAccountsSignal.asReadonly();
```

**Methods**:

1. **setBankAccounts(bankAccounts: BankAccountModel[]): void**
   - Sets complete list of bank accounts

2. **addBankAccount(bankAccount: BankAccountModel): void**
   - Adds new bank account to list

3. **updateBankAccount(updatedAccount: BankAccountModel): void**
   - Updates existing account by ID

4. **removeBankAccount(accountId: number): void**
   - Removes account from list

5. **clearBankAccounts(): void**
   - Clears all bank accounts

6. **getBankAccountsValue(): BankAccountModel[]**
   - Returns non-reactive snapshot

### Filter Configuration

| Field | Filter Type | English Header | Arabic Header |
|-------|-------------|----------------|---------------|
| AccountHolderName | Multi-select | Account Holder Name | اسم صاحب الحساب |
| PhoneNumber | Multi-select | Phone Number | رقم التيليفون |
| BankName | Multi-select | Bank Name | اسم البنك |
| AccountNumber | Multi-select | Account Number | رقم الحساب |
| IBAN | Multi-select | IBAN | الآيبان |
| Balance | Numeric | Balance | الرصيد |

---

## Yellow Cards

### Overview
The Yellow Cards module manages prepaid card accounts with expiry dates, limits, and usage tracking.

### Data Model

#### YellowCardModel
```typescript
interface YellowCardModel extends BaseEntityModel {
  CaredHolderName: string;         // Card holder name (typo in original)
  CardNumber: number;              // Card number
  ExpiryDate: Date | string;       // Card expiration date
  MonthlyLimit: number;            // Monthly transaction limit
  DailyLimit: number;              // Daily transaction limit
  Balance: number;                 // Current card balance
  Status: YellowCardStatusEnum;    // Card status
  NationalId: number;              // National ID of card holder
  MonthlyUsed?: number;            // Amount used this month
  DailyUsed?: number;              // Amount used today
  Notes: string;                   // Additional notes
}
```

#### Enums
- **YellowCardStatusEnum**: Defines card status (Active, Inactive, Expired, Blocked)

### Component Logic

#### YellowCardsList Component
**Location**: `src/app/components/pages/yellow-cards/components/list/yellow-cards-list.component.ts`

**Purpose**: Manages yellow card display and operations with full CRUD functionality.

**Key Features**:
- Signal-based reactive updates
- Privilege-based action control
- Bilingual interface
- Advanced filtering with date support
- Store integration for optimistic updates

**Component Properties**:
```typescript
mainList: YellowCardModel[]      // Complete list of yellow cards
filteredList: YellowCardModel[]  // Filtered list for display
model: any                       // Filter configuration
actionsList: ActionData[]        // Available actions
Edit/Add/Delete/Details: boolean // Permission flags
languageFactor: 'en' | 'ar'     // Current language
```

**Key Methods**:

1. **getAllRows()**
   - Fetches all yellow cards from API
   - Service updates store automatically

2. **initializeModel()**
   - Configures table columns with bilingual headers
   - Sets filter types (multi, numeric, date)
   - ExpiryDate filter is commented out

3. **showActionBaseOnPrivilege()**
   - Checks privileges for YellowCardsList page
   - Enables/disables CRUD operations
   - Only Details action added in privilege loop

4. **getActionsList()**
   - Builds Edit and Delete action buttons
   - Called after privileges are set
   - Separate from privilege method

5. **addEdit(row?: YellowCardModel)**
   - Opens add/edit dialog
   - On close, updates store optimistically
   - Differentiates between add and update operations

6. **deleteRow(ID: number)**
   - Opens confirmation dialog
   - On success, removes from store
   - Uses optimistic update pattern

**Data Flow**:
```
Component Init → getAllRows() → Service.getYellowCards() 
→ API Call → Store.setYellowCards() → Signal Update → UI Refresh
```

**Optimistic Updates**:
The component uses optimistic updates for add/edit/delete operations:
- Add: `store.addYellowCard(result)`
- Update: `store.updateYellowCard(result)`
- Delete: `store.removeYellowCard(ID)`

### Service Layer

#### YellowCardsService
**Location**: `src/app/components/pages/yellow-cards/services/yellow-cards.service.ts`

**Purpose**: Comprehensive HTTP service for yellow card operations.

**Methods**:

1. **getYellowCards(): void**
   - Endpoint: `GET /YellowCards/GetAll`
   - Fetches all yellow cards
   - Updates store on success

2. **addYellowCard(yellowCard: YellowCardModel): Observable<ResponseModel>**
   - Endpoint: `POST /YellowCards/Create`
   - Creates new yellow card
   - Returns observable for component handling

3. **updateYellowCard(yellowCard: YellowCardModel): Observable<ResponseModel>**
   - Endpoint: `PUT /YellowCards/Update/{id}`
   - Updates existing yellow card
   - Returns observable for component handling

4. **deleteYellowCard(id: number): Observable<ResponseModel>**
   - Endpoint: `DELETE /YellowCards/Delete/{id}`
   - Deletes yellow card
   - Returns observable for component handling

5. **getYellowCardById(id: number): Observable<ResponseModel>**
   - Endpoint: `GET /YellowCards/GetById/{id}`
   - Fetches single yellow card
   - Returns observable for component handling

**API Endpoints**:
```typescript
GetAll:    GET    /YellowCards/GetAll
Create:    POST   /YellowCards/Create
Update:    PUT    /YellowCards/Update/{id}
Delete:    DELETE /YellowCards/Delete/{id}
GetById:   GET    /YellowCards/GetById/{id}
```

### State Management

#### YellowCardsStore
**Location**: `src/app/components/pages/yellow-cards/store/yellow-cards.store.ts`

**Purpose**: Centralized state management with Angular Signals.

**Signal Architecture**:
```typescript
private yellowCardsSignal = signal<YellowCardModel[]>([]);
readonly yellowCards = this.yellowCardsSignal.asReadonly();
```

**Methods**:

1. **setYellowCards(yellowCards: YellowCardModel[]): void**
   - Replaces entire list

2. **addYellowCard(yellowCard: YellowCardModel): void**
   - Adds new card to list

3. **updateYellowCard(updatedCard: YellowCardModel): void**
   - Updates existing card by ID

4. **removeYellowCard(cardId: number): void**
   - Removes card from list

5. **clearYellowCards(): void**
   - Clears all cards

6. **getYellowCardsValue(): YellowCardModel[]**
   - Returns non-reactive snapshot

### Filter Configuration

| Field | Filter Type | English Header | Arabic Header |
|-------|-------------|----------------|---------------|
| CardHolderName | Multi-select | Card Holder Name | اسم حامل البطاقة |
| CardNumber | Multi-select | Card Number | رقم البطاقة |
| MonthlyLimit | Numeric | Monthly Limit | الحد الشهري |
| MonthlyUsed | Numeric | Monthly Used | الإستخدام الشهري |
| DailyLimit | Numeric | Daily Limit | الحد اليومي |
| DailyUsed | Numeric | Daily Used | الإستخدام اليومي |
| Balance | Numeric | Balance | الرصيد |
| Status | Multi-select | Status | الحالة |

---

## Credit Cards

### Overview
The Credit Cards module manages credit card information including limits, balances, expiry dates, and status tracking.

### Data Model

#### CreditCardModel
```typescript
interface CreditCardModel extends BaseEntityModel {
  CardHolderName: string;          // Card holder name
  CardNumber: number;              // Credit card number
  Limit: number;                   // Credit limit
  Balance: number;                 // Current balance/available credit
  Status: CreditCardStatusEnum;    // Card status
  ExpiryDate: Date | string;       // Card expiration date
  Notes: string;                   // Additional notes
  NationalId: number;              // National ID of card holder
}
```

#### Enums
- **CreditCardStatusEnum**: Defines card status (Active, Inactive, Expired, Blocked, Suspended)

### Component Logic

#### CreditCardsList Component
**Location**: `src/app/components/pages/credit-cards/components/list/credit-cards-list.component.ts`

**Purpose**: Manages credit card display and operations with comprehensive CRUD functionality.

**Key Features**:
- Signal-based reactive data management
- Privilege-based access control
- Bilingual support (English/Arabic)
- Date filtering for expiry dates
- Optimistic UI updates

**Component Properties**:
```typescript
mainList: CreditCardModel[]      // Complete list of credit cards
filteredList: CreditCardModel[]  // Filtered list for display
model: any                       // Filter configuration
actionsList: ActionData[]        // Available actions
Edit/Add/Delete/Details: boolean // Permission flags (default false)
languageFactor: 'en' | 'ar'     // Current language
```

**Key Methods**:

1. **getAllRows()**
   - Fetches all credit cards from API
   - Service automatically updates store

2. **initializeModel()**
   - Configures table columns with bilingual headers
   - Sets up filter types for each field
   - Includes date filter for ExpiryDate
   - NationalId and Notes filters are commented out

3. **showActionBaseOnPrivilege()**
   - Evaluates user privileges for CreditCardsList
   - Enables CRUD operations based on permissions
   - Only Details action added in privilege loop

4. **getActionsList()**
   - Builds Edit and Delete action buttons
   - Called after privileges are set
   - Separate from privilege evaluation

5. **addEdit(row?: CreditCardModel)**
   - Opens dialog for add/edit operations
   - On close, updates store optimistically
   - Differentiates between add and update

6. **deleteRow(ID: number)**
   - Opens confirmation dialog
   - On success, removes from store
   - Uses optimistic update pattern

**Data Flow**:
```
Component Init → getAllRows() → Service.getCreditCards() 
→ API Call → Store.setCreditCards() → Signal Update → UI Refresh
```

**Optimistic Updates**:
- Add: `store.addCreditCard(result)`
- Update: `store.updateCreditCard(result)`
- Delete: `store.removeCreditCard(ID)`

### Service Layer

#### CreditCardsService
**Location**: `src/app/components/pages/credit-cards/services/credit-cards.service.ts`

**Purpose**: Comprehensive HTTP service for credit card operations.

**Methods**:

1. **getCreditCards(): void**
   - Endpoint: `GET /CreditCards/GetAll`
   - Fetches all credit cards
   - Updates store automatically on success

2. **addCreditCard(creditCard: CreditCardModel): Observable<ResponseModel>**
   - Endpoint: `POST /CreditCards/Create`
   - Creates new credit card
   - Returns observable for component handling

3. **updateCreditCard(creditCard: CreditCardModel): Observable<ResponseModel>**
   - Endpoint: `PUT /CreditCards/Update/{id}`
   - Updates existing credit card
   - Returns observable for component handling

4. **deleteCreditCard(id: number): Observable<ResponseModel>**
   - Endpoint: `DELETE /CreditCards/Delete/{id}`
   - Deletes credit card
   - Returns observable for component handling

5. **getCreditCardById(id: number): Observable<ResponseModel>**
   - Endpoint: `GET /CreditCards/GetById/{id}`
   - Fetches single credit card
   - Returns observable for component handling

**API Endpoints**:
```typescript
GetAll:    GET    /CreditCards/GetAll
Create:    POST   /CreditCards/Create
Update:    PUT    /CreditCards/Update/{id}
Delete:    DELETE /CreditCards/Delete/{id}
GetById:   GET    /CreditCards/GetById/{id}
```

### State Management

#### CreditCardsStore
**Location**: `src/app/components/pages/credit-cards/store/credit-cards.store.ts`

**Purpose**: Centralized state management using Angular Signals.

**Signal Architecture**:
```typescript
private creditCardsSignal = signal<CreditCardModel[]>([]);
readonly creditCards = this.creditCardsSignal.asReadonly();
```

**Methods**:

1. **setCreditCards(creditCards: CreditCardModel[]): void**
   - Replaces entire credit cards list

2. **addCreditCard(creditCard: CreditCardModel): void**
   - Adds new credit card to list

3. **updateCreditCard(updatedCard: CreditCardModel): void**
   - Updates existing card by ID

4. **removeCreditCard(cardId: number): void**
   - Removes card from list

5. **clearCreditCards(): void**
   - Clears all credit cards

6. **getCreditCardsValue(): CreditCardModel[]**
   - Returns non-reactive snapshot

### Filter Configuration

| Field | Filter Type | English Header | Arabic Header |
|-------|-------------|----------------|---------------|
| CardHolderName | Multi-select | Card Holder Name | اسم حامل البطاقة |
| CardNumber | Multi-select | Card Number | رقم البطاقة |
| CreditLimit | Numeric | Limit | الحد |
| Balance | Numeric | Balance | الرصيد |
| Status | Multi-select | Status | الحالة |
| ExpiryDate | Date | Expiry Date | تاريخ الانتهاء |

---

## Traders

### Overview
The Traders module manages trader/merchant information including contact details and identification.

### Data Model

#### TraderModel
```typescript
interface TraderModel extends BaseEntityModel {
  Name: string;          // Trader name
  PhoneNumber: number;   // Contact phone number
  NationalId: number;    // National ID
}
```

### Component Logic

#### TradersList Component
**Location**: `src/app/components/pages/traders/components/list/traders-list.component.ts`

**Purpose**: Manages trader display and operations with CRUD functionality.

**Key Features**:
- Signal-based reactive data management
- Privilege-based access control
- Bilingual support (English/Arabic)
- Simplified data model
- Optimistic UI updates

**Component Properties**:
```typescript
mainList: TraderModel[]          // Complete list of traders
filteredList: TraderModel[]      // Filtered list for display
model: any                       // Filter configuration
actionsList: ActionData[]        // Available actions
Edit/Add/Delete/Details: boolean // Permission flags (default false)
languageFactor: 'en' | 'ar'     // Current language
```

**Key Methods**:

1. **getAllRows()**
   - Fetches all traders from API
   - Service updates store automatically

2. **initializeModel()**
   - Configures table columns with bilingual headers
   - Sets up multi-select filters
   - NationalID filter is commented out

3. **showActionBaseOnPrivilege()**
   - Checks privileges for TradersList page
   - Enables CRUD operations based on permissions
   - Only Details action added in privilege loop

4. **getActionsList()**
   - Builds Edit and Delete action buttons
   - Called after privileges are set

5. **addEdit(row?: TraderModel)**
   - Opens dialog for add/edit operations
   - On close, updates store optimistically
   - Uses ternary for add vs update

6. **deleteRow(ID: number)**
   - Opens confirmation dialog
   - On success, removes from store
   - Uses optimistic update pattern

**Data Flow**:
```
Component Init → getAllRows() → Service.getTraders() 
→ API Call → Store.setTraders() → Signal Update → UI Refresh
```

**Optimistic Updates**:
- Add/Update: `row ? store.updateTrader(trader) : store.addTrader(trader)`
- Delete: `store.removeTrader(ID)`

### Service Layer

#### TradersService
**Location**: `src/app/components/pages/traders/services/traders.service.ts`

**Purpose**: HTTP service for trader operations.

**Methods**:

1. **getTraders(): void**
   - Endpoint: `GET /Traders/GetAll`
   - Fetches all traders
   - Updates store on success
   - Error handling with console logging

**API Integration**:
```typescript
URL: ${API_ENDPOINT}Traders/GetAll
Method: GET
Response: ResponseModel { Success: boolean, Data: TraderModel[] }
```

**Note**: Unlike other modules, this service only implements the GetAll method. Create, Update, Delete, and GetById methods are not implemented.

### State Management

#### TradersStore
**Location**: `src/app/components/pages/traders/store/traders.store.ts`

**Purpose**: Centralized state management using Angular Signals.

**Signal Architecture**:
```typescript
private tradersSignal = signal<TraderModel[]>([]);
readonly traders = this.tradersSignal.asReadonly();
```

**Methods**:

1. **setTraders(traders: TraderModel[]): void**
   - Replaces entire traders list

2. **addTrader(trader: TraderModel): void**
   - Adds new trader to list

3. **updateTrader(updatedTrader: TraderModel): void**
   - Updates existing trader by ID

4. **removeTrader(traderId: number): void**
   - Removes trader from list

5. **clearTraders(): void**
   - Clears all traders

6. **getTradersValue(): TraderModel[]**
   - Returns non-reactive snapshot

### Filter Configuration

| Field | Filter Type | English Header | Arabic Header |
|-------|-------------|----------------|---------------|
| Name | Multi-select | Name | الأسم |
| PhoneNumber | Multi-select | Phone Number | رقم التيليفون |

---

## Common Patterns & Architecture

### Shared Architecture Patterns

All five components follow a consistent architectural pattern:

#### 1. **Component-Service-Store Pattern**
```
Component (UI Logic) ↔ Service (HTTP) ↔ Store (State)
                                        ↓
                                    Signal (Reactive)
```

#### 2. **Signal-Based State Management**
All modules use Angular Signals for reactive state:
- Private writable signal
- Public readonly accessor
- Immutable update patterns
- Automatic change detection

#### 3. **Privilege-Based Access Control**
All components implement:
- `showActionBaseOnPrivilege()` - Evaluates user permissions
- Dynamic action list building
- Conditional rendering of CRUD buttons

#### 4. **Bilingual Support**
All components support:
- English and Arabic languages
- Dynamic header switching
- Language-aware dialog titles

#### 5. **Filter Configuration**
All components provide:
- Multi-select filters for text/enum fields
- Numeric filters for number fields
- Date filters for date fields (where applicable)

### BaseEntityModel

All models extend `BaseEntityModel` which provides:
```typescript
interface BaseEntityModel {
  Id: number;              // Unique identifier
  CreatedBy?: number;      // User who created the record
  CreatedDateTime?: Date;  // Creation timestamp
  UpdatedBy?: number;      // User who last updated
  UpdatedDateTime?: Date;  // Last update timestamp
  DeletedBy?: number;      // User who deleted (soft delete)
  DeletedDateTime?: Date;  // Deletion timestamp
  IsDeleted?: boolean;     // Soft delete flag
}
```

### ResponseModel

All API responses follow this structure:
```typescript
interface ResponseModel {
  Success: boolean;    // Indicates if operation succeeded
  Data: any;          // Response payload
  Message?: string;   // Optional message
  Errors?: any[];     // Optional error details
}
```

### Common Dependencies

All components share these dependencies:
- **CommonModule**: Angular common directives
- **SharedModule**: Application-wide shared components
- **PrimeNG**: UI component library (DynamicDialog, DialogService)
- **PrivilegeService**: User permission management
- **LanguagesService**: Internationalization
- **SharedService**: Common utilities
- **Constant**: API endpoint configuration

### Lifecycle Hooks

All components implement:
- **ngOnInit()**: Fetches initial data via `getAllRows()`
- **ngOnDestroy()**: Cleans up lists (sets to empty arrays)
- **effect()**: Reacts to signal changes (in constructor)

### Dialog Patterns

All components use consistent dialog configuration:
```typescript
{
  header: string,              // Bilingual title
  contentStyle: { overflow: 'auto' },
  data: any,                   // Data to pass to dialog
  baseZIndex: 10000,
  maximizable: true,           // For add/edit dialogs
  resizable: true,             // For add/edit dialogs
  styleClass: 'lg-dialog-width' | 'xs-dialog-width'
}
```

### Error Handling

All services implement error handling:
```typescript
.subscribe({
  next: (res) => { /* Handle success */ },
  error: (error) => {
    console.error('Error loading [entity]:', error);
  }
});
```

---

## API Endpoint Summary

### Wallets
- `GET /ElectronicWallets/GetAll` - Fetch all wallets
- `POST /ElectronicWallets/Delete` - Delete wallet

### Bank Accounts
- `GET /BankAccounts/GetAll` - Fetch all bank accounts
- `POST /BankAccounts/Delete` - Delete bank account

### Yellow Cards
- `GET /YellowCards/GetAll` - Fetch all yellow cards
- `POST /YellowCards/Create` - Create yellow card
- `PUT /YellowCards/Update/{id}` - Update yellow card
- `DELETE /YellowCards/Delete/{id}` - Delete yellow card
- `GET /YellowCards/GetById/{id}` - Get single yellow card

### Credit Cards
- `GET /CreditCards/GetAll` - Fetch all credit cards
- `POST /CreditCards/Create` - Create credit card
- `PUT /CreditCards/Update/{id}` - Update credit card
- `DELETE /CreditCards/Delete/{id}` - Delete credit card
- `GET /CreditCards/GetById/{id}` - Get single credit card

### Traders
- `GET /Traders/GetAll` - Fetch all traders
- `POST /Traders/Delete` - Delete trader

---

## Best Practices & Recommendations

### Current Implementation Strengths
1. ✅ Consistent architecture across all modules
2. ✅ Signal-based reactive state management
3. ✅ Separation of concerns (Component/Service/Store)
4. ✅ Bilingual support
5. ✅ Privilege-based access control
6. ✅ Optimistic UI updates

### Potential Improvements

#### 1. **Service Layer Consistency**
- Yellow Cards and Credit Cards have full CRUD methods
- Wallets, Bank Accounts, and Traders only have GetAll
- **Recommendation**: Implement complete CRUD methods for all services

#### 2. **Error Handling**
- Currently only console.error logging
- **Recommendation**: Implement user-facing error notifications using toast/snackbar

#### 3. **Loading States**
- No loading indicators during API calls
- **Recommendation**: Add loading signals to stores and display spinners

#### 4. **Type Safety**
- Some `any` types in component models
- **Recommendation**: Create proper TypeScript interfaces for filter models

#### 5. **Delete Confirmation**
- Uses generic delete modal
- **Recommendation**: Add entity-specific confirmation messages

#### 6. **Commented Code**
- Several commented-out filter fields and refresh calls
- **Recommendation**: Clean up or document why code is commented

#### 7. **Privilege Logic Split**
- Some components split privilege logic between two methods
- **Recommendation**: Consolidate into single method for clarity

#### 8. **API Response Handling**
- No validation of response data structure
- **Recommendation**: Add runtime type checking or validation

#### 9. **Store Methods**
- `getXValue()` methods rarely used
- **Recommendation**: Remove if not needed or document use cases

#### 10. **Naming Consistency**
- YellowCardModel has typo: `CaredHolderName` should be `CardHolderName`
- **Recommendation**: Fix typo and update all references

---

## Usage Examples

### Fetching Data
```typescript
// In component ngOnInit
ngOnInit(): void {
  this.getAllRows(); // Triggers service → store → signal → UI update
}
```

### Adding New Record
```typescript
// In dialog close handler
this.ref.onClose.subscribe((result) => {
  if (result) {
    this.store.addEntity(result); // Optimistic update
  }
});
```

### Updating Record
```typescript
// In dialog close handler
this.ref.onClose.subscribe((result) => {
  if (result && row) {
    this.store.updateEntity(result); // Optimistic update
  }
});
```

### Deleting Record
```typescript
// In delete confirmation handler
this.ref.onClose.subscribe((confirmed) => {
  if (confirmed) {
    this.store.removeEntity(id); // Optimistic update
  }
});
```

### Reactive Data Binding
```typescript
// In component constructor
effect(() => {
  this.mainList = this.store.entities();
  this.filteredList = [...this.mainList];
});
```

---

## Troubleshooting

### Common Issues

#### 1. **Data Not Updating**
- **Cause**: Store signal not triggering effect
- **Solution**: Ensure using `.update()` or `.set()` methods, not direct mutation

#### 2. **Actions Not Showing**
- **Cause**: Privileges not loaded or incorrect page name
- **Solution**: Verify privilege page name matches component check

#### 3. **Filters Not Working**
- **Cause**: Filter configuration mismatch with model properties
- **Solution**: Ensure filter keys match model property names exactly

#### 4. **Language Not Switching**
- **Cause**: Language service subscription not updating
- **Solution**: Verify language service is properly injected and subscribed

#### 5. **Dialog Not Closing**
- **Cause**: Missing DynamicDialogRef.close() call
- **Solution**: Ensure dialog component calls ref.close(data) on save/cancel

---

## Conclusion

These five components form the core payment method management system of the E-Transactions application. They follow a consistent, modern Angular architecture using Signals for reactive state management, providing a robust foundation for financial transaction handling.

The modular design allows for easy maintenance, testing, and extension while maintaining code consistency across the application.
