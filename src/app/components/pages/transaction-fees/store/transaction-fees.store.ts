import { Injectable, signal } from '@angular/core';
import { TransactionFeeModel } from '../core/models/transaction-fee.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionFeesStore {
  
  // Signal to store the transaction fees list
  private transactionFeesSignal = signal<TransactionFeeModel[]>([]);
  
  // Read-only accessor for the signal
  readonly transactionFees = this.transactionFeesSignal.asReadonly();

  /**
   * Set the transaction fees list
   * @param fees - Array of transaction fee models
   */
  setTransactionFees(fees: TransactionFeeModel[]): void {
    this.transactionFeesSignal.set(fees);
  }

  /**
   * Add a single transaction fee to the list
   * @param fee - Transaction fee model to add
   */
  addTransactionFee(fee: TransactionFeeModel): void {
    this.transactionFeesSignal.update(fees => [...fees, fee]);
  }

  /**
   * Update a transaction fee in the list
   * @param updatedFee - Updated transaction fee model
   */
  updateTransactionFee(updatedFee: TransactionFeeModel): void {
    this.transactionFeesSignal.update(fees => 
      fees.map(fee => 
        fee.Id === updatedFee.Id ? updatedFee : fee
      )
    );
  }

  /**
   * Remove a transaction fee from the list
   * @param feeId - ID of the transaction fee to remove
   */
  removeTransactionFee(feeId: number): void {
    this.transactionFeesSignal.update(fees => 
      fees.filter(fee => fee.Id !== feeId)
    );
  }

  /**
   * Clear all transaction fees
   */
  clearTransactionFees(): void {
    this.transactionFeesSignal.set([]);
  }

  /**
   * Get current transaction fees value (non-reactive)
   */
  getTransactionFeesValue(): TransactionFeeModel[] {
    return this.transactionFeesSignal();
  }
}
