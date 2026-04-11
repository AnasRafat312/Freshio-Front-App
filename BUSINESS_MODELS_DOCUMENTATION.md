# Business Logic & Data Models Documentation

This document provides business logic and data model documentation for the core payment method components in the E-Transactions System.

## Table of Contents
- [Base Entity Model](#base-entity-model)
- [Wallets](#wallets)
- [Bank Accounts](#bank-accounts)
- [Yellow Cards](#yellow-cards)
- [Credit Cards](#credit-cards)
- [Traders](#traders)
- [Business Relationships](#business-relationships)

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
- **Audit Trail**: Tracks who created and deleted records for compliance and accountability
- **Soft Delete**: Allows data recovery by marking records as deleted instead of permanent removal
- **Multi-tenancy**: Supports company-based data segregation via CompanyID for enterprise deployments
- **Temporal Tracking**: Maintains creation and deletion timestamps for historical analysis

---

## Wallets

### Business Overview
The Wallets module manages electronic wallet accounts for mobile money services. It supports multiple telecom providers and tracks financial limits, balances, and usage patterns to ensure compliance with transaction limits and prevent fraud.

### Business Domain
- **Industry**: Mobile Financial Services / FinTech
- **Purpose**: Digital wallet management for cashless transactions
- **Compliance**: KYC (Know Your Customer) requirements via National ID
- **Risk Management**: Daily and monthly transaction limits

### Business Rules
1. Each wallet must be linked to a unique phone number
2. National ID is required for KYC compliance
3. Daily transaction limits cannot exceed monthly limits
4. Usage tracking resets daily and monthly
5. Wallets can only process transactions when status is "Available"
6. Each wallet is associated with a single provider
7. Balance cannot go negative
8. Limits are enforced before transaction approval

### WalletModel Interface
```typescript
interface WalletModel extends BaseEntityModel {
  PhoneNumber: number;           // Mobile number associated with the wallet (unique identifier)
  Name: string;                  // Account holder's full name
  MonthlyLimit: number;          // Maximum allowed monthly transactions (in currency units)
  DailyLimit: number;            // Maximum allowed daily transactions (in currency units)
  Balance: number;               // Current available balance in the wallet
  Status: WalletStatusEnum;      // Current operational status (Available/Unavailable)
  NationalId: number;            // National identification number for KYC compliance
  Provider: WalletProviderEnum;  // Telecom provider operating the wallet service
  MonthlyUsed?: number;          // Cumulative amount used in current calendar month
  DailyUsed?: number;            // Cumulative amount used today
  Notes: string;                 // Administrative notes, remarks, or special instructions
}
```

### Field Business Descriptions

| Field | Business Meaning | Validation Rules |
|-------|-----------------|------------------|
| PhoneNumber | Customer's registered mobile number | Must be valid, unique, active |
| Name | Legal name matching ID documents | Required, min 3 characters |
| MonthlyLimit | Regulatory or business-defined monthly cap | Must be > 0, >= DailyLimit |
| DailyLimit | Daily spending/transfer limit | Must be > 0, <= MonthlyLimit |
| Balance | Real-time available funds | Cannot be negative |
| Status | Operational state of wallet | Available or Unavailable only |
| NationalId | Government-issued ID for KYC | Required, must be valid format |
| Provider | Service provider/operator | Must match supported providers |
| MonthlyUsed | Running total for current month | Auto-calculated, read-only |
| DailyUsed | Running total for current day | Auto-calculated, read-only |
| Notes | Internal administrative information | Optional, for staff use |

### Enums

#### WalletStatusEnum
```typescript
enum WalletStatusEnum {
  Available = 1,      // Wallet is active and can process transactions
  Unavailable = 2     // Wallet is inactive, suspended, or blocked
}
```

**Business States:**
- **Available (1)**: Wallet passes all checks and can send/receive money
- **Unavailable (2)**: Wallet is temporarily or permanently disabled due to:
  - Regulatory compliance issues
  - Fraud detection triggers
  - Customer request
  - Administrative suspension
  - KYC verification pending

#### WalletProviderEnum
```typescript
enum WalletProviderEnum {
  Vodafone = 1,       // Vodafone Cash mobile wallet service
  Etisalat = 2,       // Etisalat mobile wallet service
  Access = 3          // Access mobile wallet service
}
```

**Provider Details:**
- **Vodafone (1)**: Vodafone Cash - Leading mobile money provider
- **Etisalat (2)**: Etisalat mobile wallet - Telecom-based financial service
- **Access (3)**: Access mobile wallet - Alternative provider

### Business Use Cases

1. **Customer Wallet Registration**
   - Register new wallet with KYC verification
   - Link to phone number and national ID
   - Set initial limits based on customer tier
   - Activate wallet upon verification

2. **Transaction Processing**
   - Validate wallet status before transaction
   - Check daily and monthly limits
   - Verify sufficient balance
   - Update usage counters
   - Process payment/transfer

3. **Balance Management**
   - Top-up wallet balance
   - Withdraw funds
   - Track balance changes
   - Generate balance statements

4. **Limit Monitoring & Enforcement**
   - Monitor daily usage against daily limit
   - Monitor monthly usage against monthly limit
   - Block transactions exceeding limits
   - Alert customers approaching limits

5. **Provider Management**
   - Support multiple wallet providers
   - Route transactions to correct provider
   - Handle provider-specific rules

6. **Compliance & Risk Management**
   - Suspend wallets for compliance review
   - Block suspicious activity
   - Maintain audit trail
   - Generate compliance reports

---

## Bank Accounts

### Business Overview
The Bank Accounts module manages traditional banking account information for users. It stores account holder details, bank information, and balances for integration with conventional banking systems.

### Business Domain
- **Industry**: Traditional Banking / Financial Services
- **Purpose**: Bank account management for fund transfers and payments
- **Integration**: Links users to their traditional bank accounts
- **Scope**: Multi-bank support for diverse customer base

### Business Rules
1. Each bank account must have a unique account number
2. IBAN is required for international transactions
3. Account holder name must match bank records
4. Balance reflects current available funds
5. Phone number serves as contact and verification method
6. Multiple accounts can belong to same user
7. Bank name must be from approved financial institutions

### BankAccountModel Interface
```typescript
interface BankAccountModel extends BaseEntityModel {
  AccountHolderName: string;  // Legal name of the account owner
  PhoneNumber: number;        // Contact phone number for verification
  Balance: number;            // Current account balance
  BankName: string;           // Name of the financial institution
  AccountNumber: number;      // Unique bank account number
  IBAN: number;              // International Bank Account Number
}
```

### Field Business Descriptions

| Field | Business Meaning | Validation Rules |
|-------|-----------------|------------------|
| AccountHolderName | Legal name on bank account | Must match bank records |
| PhoneNumber | Registered contact number | Valid, verified number |
| Balance | Current available balance | Read-only, synced from bank |
| BankName | Financial institution name | Must be approved bank |
| AccountNumber | Bank-issued account number | Unique, valid format |
| IBAN | International account identifier | Valid IBAN format |

### Business Use Cases

1. **Account Registration**
   - Link user to their bank account
   - Verify account ownership
   - Store account details for future transactions

2. **Fund Transfers**
   - Transfer money to/from bank accounts
   - Verify sufficient balance
   - Process inter-bank transfers

3. **Balance Inquiry**
   - Check current account balance
   - View transaction history
   - Generate account statements

4. **Multi-Bank Support**
   - Support accounts from different banks
   - Handle bank-specific requirements
   - Manage cross-bank transactions

5. **Account Verification**
   - Verify account holder identity
   - Validate account numbers
   - Confirm IBAN accuracy

---

## Yellow Cards

### Business Overview
The Yellow Cards module manages prepaid card accounts with expiration dates, transaction limits, and usage tracking. These are typically government-issued or subsidized cards for specific demographics or purposes.

### Business Domain
- **Industry**: Prepaid Card Services / Government Programs
- **Purpose**: Manage prepaid/subsidized card accounts
- **Target**: Specific demographic groups or social programs
- **Regulation**: Government-mandated limits and controls

### Business Rules
1. Each card has a unique card number
2. Cards have expiration dates and become invalid after expiry
3. Daily and monthly transaction limits apply
4. Cards must be linked to a national ID for KYC
5. Usage tracking prevents limit violations
6. Cards can be available or unavailable
7. Balance cannot exceed card limits
8. Expired cards cannot process transactions

### YellowCardModel Interface
```typescript
interface YellowCardModel extends BaseEntityModel {
  CaredHolderName: string;         // Card holder's full name
  CardNumber: number;              // Unique card identification number
  ExpiryDate: Date | string;       // Card expiration date
  MonthlyLimit: number;            // Maximum monthly transaction limit
  DailyLimit: number;              // Maximum daily transaction limit
  Balance: number;                 // Current available balance on card
  Status: YellowCardStatusEnum;    // Current card status
  NationalId: number;              // National ID for KYC compliance
  MonthlyUsed?: number;            // Amount used in current month
  DailyUsed?: number;              // Amount used today
  Notes: string;                   // Administrative notes
}
```

### Field Business Descriptions

| Field | Business Meaning | Validation Rules |
|-------|-----------------|------------------|
| CaredHolderName | Cardholder's legal name | Must match ID documents |
| CardNumber | Unique card identifier | Must be unique, valid format |
| ExpiryDate | Card validity end date | Must be future date when issued |
| MonthlyLimit | Monthly spending cap | Must be > 0, >= DailyLimit |
| DailyLimit | Daily spending cap | Must be > 0, <= MonthlyLimit |
| Balance | Available funds on card | Cannot exceed limits |
| Status | Operational state | Available or Unavailable |
| NationalId | Government ID for KYC | Required, valid format |
| MonthlyUsed | Current month usage | Auto-calculated |
| DailyUsed | Today's usage | Auto-calculated |
| Notes | Internal remarks | Optional |

### Enums

#### YellowCardStatusEnum
```typescript
enum YellowCardStatusEnum {
  Available = 1,      // Card is active and can be used
  Unavailable = 2     // Card is inactive, expired, or blocked
}
```

**Business States:**
- **Available (1)**: Card is valid, not expired, and can process transactions
- **Unavailable (2)**: Card cannot be used due to:
  - Expiration date passed
  - Card reported lost/stolen
  - Suspended for investigation
  - Limit violations
  - Failed KYC verification

### Business Use Cases

1. **Card Issuance**
   - Issue new prepaid cards
   - Set initial limits and expiry
   - Link to cardholder's national ID
   - Activate card for use

2. **Transaction Processing**
   - Validate card status and expiry
   - Check daily/monthly limits
   - Verify sufficient balance
   - Process payment
   - Update usage counters

3. **Card Renewal**
   - Extend expiry date
   - Issue replacement cards
   - Transfer balance to new card

4. **Limit Management**
   - Enforce daily spending limits
   - Enforce monthly spending limits
   - Track usage patterns
   - Alert on limit approach

5. **Expiry Management**
   - Monitor card expiration
   - Notify cardholders before expiry
   - Block expired cards
   - Handle balance transfers

6. **Compliance & Fraud Prevention**
   - Verify cardholder identity
   - Block suspicious transactions
   - Maintain transaction audit trail
   - Generate compliance reports

---

## Credit Cards

### Business Overview
The Credit Cards module manages credit card information including credit limits, balances, expiration dates, and status tracking. It supports credit-based payment processing and credit line management.

### Business Domain
- **Industry**: Credit/Lending Services
- **Purpose**: Credit card account management
- **Credit Management**: Track credit limits and utilization
- **Risk**: Monitor credit exposure and payment behavior

### Business Rules
1. Each credit card has a unique card number
2. Credit limit defines maximum borrowing capacity
3. Balance represents current debt/outstanding amount
4. Cards have expiration dates
5. Expired cards cannot process transactions
6. Credit limit cannot be exceeded
7. National ID required for credit approval
8. Card status controls transaction authorization

### CreditCardModel Interface
```typescript
interface CreditCardModel extends BaseEntityModel {
  CardHolderName: string;          // Legal name of cardholder
  CardNumber: number;              // Unique credit card number
  Limit: number;                   // Maximum credit limit
  Balance: number;                 // Current outstanding balance/debt
  Status: CreditCardStatusEnum;    // Current card status
  ExpiryDate: Date | string;       // Card expiration date
  Notes: string;                   // Administrative notes
  NationalId: number;              // National ID for credit verification
}
```

### Field Business Descriptions

| Field | Business Meaning | Validation Rules |
|-------|-----------------|------------------|
| CardHolderName | Cardholder's legal name | Must match credit application |
| CardNumber | Unique card identifier | Must be unique, valid format |
| Limit | Maximum credit line | Must be > 0, based on creditworthiness |
| Balance | Current debt amount | 0 <= Balance <= Limit |
| Status | Card operational state | Controls transaction authorization |
| ExpiryDate | Card validity end date | Must be future date when issued |
| Notes | Internal credit notes | Optional, for credit team |
| NationalId | ID for credit check | Required for credit approval |

### Enums

#### CreditCardStatusEnum
```typescript
enum CreditCardStatusEnum {
  Available = 1,      // Card is active and can process transactions
  Unavailable = 2     // Card is inactive or blocked
}
```

**Business States:**
- **Available (1)**: Card is active, not expired, within credit limit
- **Unavailable (2)**: Card cannot be used due to:
  - Expiration date passed
  - Credit limit exceeded
  - Payment default
  - Card reported lost/stolen
  - Fraud detection
  - Administrative suspension

### Business Use Cases

1. **Credit Card Issuance**
   - Approve credit application
   - Set credit limit based on assessment
   - Issue card with expiry date
   - Link to cardholder's national ID

2. **Transaction Authorization**
   - Validate card status and expiry
   - Check available credit (Limit - Balance)
   - Authorize purchase
   - Update balance

3. **Credit Management**
   - Monitor credit utilization
   - Adjust credit limits
   - Track payment history
   - Calculate interest

4. **Payment Processing**
   - Process cardholder payments
   - Reduce outstanding balance
   - Update available credit
   - Generate payment receipts

5. **Card Lifecycle**
   - Renew expiring cards
   - Replace lost/stolen cards
   - Close accounts
   - Transfer balances

6. **Risk Management**
   - Monitor over-limit situations
   - Detect fraudulent patterns
   - Suspend high-risk cards
   - Generate risk reports

---

## Traders

### Business Overview
The Traders module manages merchant/trader information for businesses that accept payments through the system. It stores basic trader identification and contact information.

### Business Domain
- **Industry**: Merchant Services / Payment Acceptance
- **Purpose**: Manage merchant/trader accounts
- **Scope**: Businesses accepting electronic payments
- **Integration**: Links merchants to payment processing

### Business Rules
1. Each trader must have a unique national ID
2. Phone number serves as primary contact
3. Trader name must be business legal name
4. Traders can accept payments from all payment methods
5. Multiple payment accounts can link to one trader
6. Trader information used for settlement and reporting

### TraderModel Interface
```typescript
interface TraderModel extends BaseEntityModel {
  Name: string;          // Business/trader legal name
  PhoneNumber: number;   // Primary contact phone number
  NationalId: number;    // Business registration or owner's national ID
}
```

### Field Business Descriptions

| Field | Business Meaning | Validation Rules |
|-------|-----------------|------------------|
| Name | Legal business or trader name | Required, must be unique |
| PhoneNumber | Primary contact number | Valid, verified number |
| NationalId | Business registration or owner ID | Unique, valid format |

### Business Use Cases

1. **Merchant Registration**
   - Register new trader/merchant
   - Verify business credentials
   - Link to national ID/business registration
   - Activate merchant account

2. **Payment Acceptance**
   - Accept payments from customers
   - Process transactions
   - Track sales and revenue
   - Generate transaction reports

3. **Settlement Management**
   - Calculate merchant settlements
   - Process payouts to traders
   - Generate settlement reports
   - Track commission/fees

4. **Merchant Verification**
   - Verify trader identity
   - Validate business registration
   - Confirm contact information
   - Maintain merchant profiles

5. **Reporting & Analytics**
   - Track merchant transaction volume
   - Analyze merchant performance
   - Generate merchant statements
   - Monitor merchant activity

---

## Business Relationships

### Entity Relationship Overview

```
┌─────────────┐
│   Traders   │ (Merchants accepting payments)
└──────┬──────┘
       │
       │ Accepts payments from
       │
       ├──────────────┬──────────────┬──────────────┬──────────────┐
       │              │              │              │              │
       ▼              ▼              ▼              ▼              ▼
┌────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Wallets   │ │ Bank Accounts│ │ Yellow Cards │ │ Credit Cards │ │   (Other)    │
└────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
     │                │                │                │
     │                │                │                │
     └────────────────┴────────────────┴────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  Transactions │ (Payment processing)
              └───────────────┘
```

### Common Patterns Across Payment Methods

All payment methods (Wallets, Bank Accounts, Yellow Cards, Credit Cards) share:

1. **Identity Verification**
   - National ID requirement
   - Phone number for contact
   - Name verification

2. **Balance/Limit Management**
   - Current balance tracking
   - Transaction limits (where applicable)
   - Usage monitoring

3. **Status Control**
   - Available/Unavailable states
   - Transaction authorization based on status

4. **Audit & Compliance**
   - Inherit from BaseEntityModel
   - Track creation and deletion
   - Maintain audit trail

### Payment Method Comparison

| Feature | Wallets | Bank Accounts | Yellow Cards | Credit Cards |
|---------|---------|---------------|--------------|--------------|
| **Type** | Mobile Money | Traditional Banking | Prepaid | Credit/Lending |
| **Balance** | Prepaid Balance | Bank Balance | Prepaid Balance | Outstanding Debt |
| **Limits** | Daily + Monthly | Bank-defined | Daily + Monthly | Credit Limit |
| **Expiry** | No | No | Yes | Yes |
| **Provider** | Telecom | Bank | Issuer | Card Network |
| **Usage Tracking** | Yes | No | Yes | Yes (Credit Utilization) |
| **KYC Required** | Yes | Yes | Yes | Yes |

### Business Process Flow

#### 1. Customer Onboarding
```
Customer Registration → KYC Verification → Payment Method Setup → Account Activation
```

#### 2. Transaction Processing
```
Transaction Request → Validate Payment Method → Check Limits/Balance → 
Process Payment → Update Balances → Notify Parties → Record Transaction
```

#### 3. Settlement Flow
```
Daily Transactions → Calculate Merchant Settlements → 
Process Payouts → Update Balances → Generate Reports
```

---

## Data Integrity & Business Constraints

### Cross-Entity Constraints

1. **National ID Uniqueness**
   - Same National ID can have multiple payment methods
   - Used for customer identification across all modules

2. **Phone Number Verification**
   - Phone numbers must be verified before activation
   - Used for transaction notifications and OTP

3. **Balance Consistency**
   - Balances must always reflect actual available funds
   - Real-time updates required for transaction processing

4. **Limit Enforcement**
   - Daily limits reset at midnight
   - Monthly limits reset on first day of month
   - Limits enforced before transaction approval

5. **Status Synchronization**
   - Status changes must be immediate
   - Unavailable status blocks all transactions
   - Status changes logged for audit

### Business Validation Rules

1. **Wallets**
   - `DailyLimit <= MonthlyLimit`
   - `DailyUsed <= DailyLimit`
   - `MonthlyUsed <= MonthlyLimit`
   - `Balance >= 0`

2. **Bank Accounts**
   - `IBAN` must be valid international format
   - `AccountNumber` must be unique per bank

3. **Yellow Cards**
   - `ExpiryDate > CurrentDate` for active cards
   - `DailyLimit <= MonthlyLimit`
   - `Balance <= MonthlyLimit`

4. **Credit Cards**
   - `Balance <= Limit`
   - `ExpiryDate > CurrentDate` for active cards
   - `Limit > 0`

5. **Traders**
   - `NationalId` must be unique
   - `PhoneNumber` must be verified

---

## Glossary

### Business Terms

- **KYC (Know Your Customer)**: Identity verification process required by financial regulations
- **IBAN**: International Bank Account Number - standardized international bank account identifier
- **Credit Limit**: Maximum amount that can be borrowed on a credit card
- **Transaction Limit**: Maximum amount that can be spent in a given period
- **Settlement**: Process of transferring funds to merchants for completed transactions
- **Soft Delete**: Marking records as deleted without physically removing them from database
- **Audit Trail**: Complete history of who did what and when for compliance
- **Multi-tenancy**: Supporting multiple companies/organizations in same system
- **Prepaid**: Payment method where funds are loaded before use
- **Credit**: Payment method where funds are borrowed and repaid later
- **Available Credit**: Credit limit minus current balance
- **Outstanding Balance**: Amount currently owed on credit card

### Status Definitions

- **Available**: Entity is active and can process transactions
- **Unavailable**: Entity is inactive and cannot process transactions
- **Expired**: Entity has passed its expiration date
- **Suspended**: Temporarily disabled, can be reactivated
- **Blocked**: Permanently disabled due to fraud or violation

---

## Compliance & Regulatory Considerations

### Financial Regulations
- All payment methods require KYC compliance
- Transaction limits enforce regulatory requirements
- Audit trails support regulatory reporting
- Soft delete maintains historical records for audits

### Data Protection
- Personal information (Name, NationalId, PhoneNumber) must be protected
- Access controls required for sensitive data
- Audit logs track all data access and modifications

### Anti-Fraud Measures
- Transaction limits prevent large-scale fraud
- Status controls allow quick suspension of suspicious accounts
- Usage tracking identifies abnormal patterns
- Multiple verification points (Phone, NationalId)

---

## Future Considerations

### Potential Enhancements
1. **Additional Payment Methods**: Support for international cards, digital currencies
2. **Enhanced Limits**: Time-based limits, transaction-count limits
3. **Tiered Customers**: Different limit tiers based on customer verification level
4. **Multi-currency**: Support for multiple currencies
5. **Loyalty Programs**: Points, rewards, cashback integration
6. **Fraud Detection**: AI-based fraud detection and prevention
7. **Real-time Notifications**: SMS/Email alerts for transactions
8. **Merchant Categories**: Categorize traders by business type
9. **Transaction History**: Detailed transaction logs per payment method
10. **Reporting Dashboard**: Business intelligence and analytics

---

## Summary

This E-Transactions System manages five core payment method types:

1. **Wallets**: Mobile money accounts with provider-specific services
2. **Bank Accounts**: Traditional banking integration
3. **Yellow Cards**: Prepaid cards with expiration
4. **Credit Cards**: Credit-based payment with limits
5. **Traders**: Merchants accepting payments

All entities share common audit fields via `BaseEntityModel` and follow consistent patterns for status management, KYC compliance, and transaction processing. The system enforces business rules through data models, enums, and validation constraints to ensure financial integrity and regulatory compliance.
