import { Injectable, signal } from '@angular/core';
import { BankAccountModel } from '../core/models/bank-account.model';
import { BankAccountDetailsModel } from '../core/models/bank-account-details.model';

@Injectable({
  providedIn: 'root'
})
export class BankAccountsStore {
  
  // Signal to store the bank accounts list
  private bankAccountsSignal = signal<BankAccountModel[]>([]);
  
  // Read-only accessor for the signal
  readonly bankAccounts = this.bankAccountsSignal.asReadonly();

  // Signal to store the selected bank account details
  private bankAccountDetailsSignal = signal<BankAccountDetailsModel | null>(null);
  
  // Read-only accessor for the details signal
  readonly bankAccountDetails = this.bankAccountDetailsSignal.asReadonly();

  /**
   * Set the bank accounts list
   * @param bankAccounts - Array of bank account models
   */
  setBankAccounts(bankAccounts: BankAccountModel[]): void {
    this.bankAccountsSignal.set(bankAccounts);
  }

  /**
   * Add a single bank account to the list
   * @param bankAccount - Bank account model to add
   */
  addBankAccount(bankAccount: BankAccountModel): void {
    this.bankAccountsSignal.update(accounts => [...accounts, bankAccount]);
  }

  /**
   * Update a bank account in the list
   * @param updatedAccount - Updated bank account model
   */
  updateBankAccount(updatedAccount: BankAccountModel): void {
    this.bankAccountsSignal.update(accounts => 
      accounts.map(account => 
        account.Id === updatedAccount.Id ? updatedAccount : account
      )
    );
  }

  /**
   * Remove a bank account from the list
   * @param accountId - ID of the bank account to remove
   */
  removeBankAccount(accountId: number): void {
    this.bankAccountsSignal.update(accounts => 
      accounts.filter(account => account.Id !== accountId)
    );
  }

  /**
   * Clear all bank accounts
   */
  clearBankAccounts(): void {
    this.bankAccountsSignal.set([]);
  }

  /**
   * Get current bank accounts value (non-reactive)
   */
  getBankAccountsValue(): BankAccountModel[] {
    return this.bankAccountsSignal();
  }

  /**
   * Set the bank account details
   * @param details - Bank account details model
   */
  setBankAccountDetails(details: BankAccountDetailsModel | null): void {
    this.bankAccountDetailsSignal.set(details);
  }

  /**
   * Clear bank account details
   */
  clearBankAccountDetails(): void {
    this.bankAccountDetailsSignal.set(null);
  }

  /**
   * Get current bank account details value (non-reactive)
   */
  getBankAccountDetailsValue(): BankAccountDetailsModel | null {
    return this.bankAccountDetailsSignal();
  }
}
