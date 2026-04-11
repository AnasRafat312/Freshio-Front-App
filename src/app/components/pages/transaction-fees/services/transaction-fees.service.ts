import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { TransactionFeeModel } from '../core/models/transaction-fee.model';
import { ResponseModel } from 'src/app/shared/model/response';

@Injectable({
  providedIn: 'root'
})
export class TransactionFeesService {

  // Signal to store the transaction fees list
  private transactionFeesSignal = signal<TransactionFeeModel[]>([]);
  
  // Read-only accessor for the signal
  readonly transactionFees = this.transactionFeesSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private constant: Constant
  ) { }

  /**
   * Get all transaction fees from the API and store in signal
   * @returns Observable<ResponseModel>
   */
  getTransactionFees(): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Fees/GetAll`;
    return this.http.get<ResponseModel>(url).pipe(
      tap((res: ResponseModel) => {
        this.transactionFeesSignal.set(res?.Data);
      })
    );
  }

  /**
   * Get current transaction fees value from signal
   */
  getTransactionFeesValue(): TransactionFeeModel[] {
    return this.transactionFeesSignal();
  }

  /**
   * Add a single transaction fee to the signal
   */
  addTransactionFee(fee: TransactionFeeModel): void {
    this.transactionFeesSignal.update(fees => [...fees, fee]);
  }

  /**
   * Update a transaction fee in the signal
   */
  updateTransactionFee(updatedFee: TransactionFeeModel): void {
    this.transactionFeesSignal.update(fees => 
      fees.map(fee => 
        fee.Id === updatedFee.Id ? updatedFee : fee
      )
    );
  }

  /**
   * Remove a transaction fee from the signal
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
}
